import { Request, Response } from 'express'
import { StartIncentivesMigrationForm } from 'express-session'
import moment from 'moment'
import NomisMigrationService, { Context } from '../../services/nomisMigrationService'
import { IncentivesMigrationFilter, MigrationHistory } from '../../@types/migration'
import { MigrationViewFilter } from '../../@types/dashboard'
import buildUrl from '../../utils/applicationInsightsUrlBuilder'
import incentivesMigrationValidator from './incentivesMigrationValidator'
import { withDefaultTime } from '../../utils/utils'
import trimForm from '../../utils/trim'
import logger from '../../../logger'
import startIncentivesMigrationValidator from './startIncentivesMigrationValidator'
import NomisPrisonerService from '../../services/nomisPrisonerService'

interface Filter {
  fromDate?: string
  toDate?: string
}

function context(res: Response): Context {
  return {
    username: res?.locals?.user?.username,
    token: res?.locals?.user?.token,
  }
}

export default class IncentivesMigrationController {
  constructor(
    private readonly nomisMigrationService: NomisMigrationService,
    private readonly nomisPrisonerService: NomisPrisonerService
  ) {}

  async getIncentiveMigrations(req: Request, res: Response): Promise<void> {
    const searchFilter = this.parseFilter(req)

    const errors = incentivesMigrationValidator(searchFilter)

    if (errors.length > 0) {
      res.render('pages/incentives/incentivesMigration', {
        errors,
        migrationViewFilter: searchFilter,
      })
    } else {
      const { migrations } = await this.nomisMigrationService.getIncentivesMigrations(context(res), {
        ...searchFilter,
        toDateTime: withDefaultTime(searchFilter.toDateTime),
        fromDateTime: withDefaultTime(searchFilter.fromDateTime),
      })

      const decoratedMigrations = migrations.map(IncentivesMigrationController.withFilter).map(history => ({
        ...history,
        applicationInsightsLink: IncentivesMigrationController.applicationInsightsUrl(
          IncentivesMigrationController.alreadyMigratedApplicationInsightsQuery(history.whenStarted, history.whenEnded)
        ),
      }))
      res.render('pages/incentives/incentivesMigration', {
        migrations: decoratedMigrations,
        migrationViewFilter: searchFilter,
        errors: [],
      })
    }
  }

  async viewFailures(req: Request, res: Response): Promise<void> {
    const failures = await this.nomisMigrationService.getIncentivesFailures(context(res))
    const failuresDecorated = {
      ...failures,
      messages: failures.messages.map(message => ({
        ...message,
        applicationInsightsLink: IncentivesMigrationController.applicationInsightsUrl(
          IncentivesMigrationController.messageApplicationInsightsQuery(message)
        ),
      })),
    }
    res.render('pages/incentives/incentivesMigrationFailures', { failures: failuresDecorated })
  }

  async startNewIncentiveMigration(req: Request, res: Response): Promise<void> {
    delete req.session.startIncentivesMigrationForm
    await this.startIncentiveMigration(req, res)
  }

  async startIncentiveMigration(req: Request, res: Response): Promise<void> {
    res.render('pages/incentives/startIncentivesMigration', {
      form: req.session.startIncentivesMigrationForm,
      errors: req.flash('errors'),
    })
  }

  async postStartIncentiveMigration(req: Request, res: Response): Promise<void> {
    req.session.startIncentivesMigrationForm = { ...trimForm(req.body) }

    const errors = startIncentivesMigrationValidator(req.session.startIncentivesMigrationForm)

    if (errors.length > 0) {
      req.flash('errors', errors)
      res.redirect('/incentives-migration/amend')
    } else {
      const filter = IncentivesMigrationController.toFilter(req.session.startIncentivesMigrationForm)
      const count = await this.nomisPrisonerService.getIncentiveMigrationEstimatedCount(filter, context(res))
      const dlqCountString = await this.nomisMigrationService.getDLQMessageCount(context(res))
      logger.info(`${dlqCountString} failures found`)

      req.session.startIncentivesMigrationForm.estimatedCount = count.toLocaleString()
      req.session.startIncentivesMigrationForm.dlqCount = dlqCountString.toLocaleString()
      res.redirect('/incentives-migration/start/preview')
    }
  }

  async startIncentiveMigrationPreview(req: Request, res: Response): Promise<void> {
    res.render('pages/incentives/startIncentivesMigrationPreview', { form: req.session.startIncentivesMigrationForm })
  }

  async postClearDLQIncentiveMigrationPreview(req: Request, res: Response): Promise<void> {
    const result = await this.nomisMigrationService.deleteIncentivesFailures(context(res))
    logger.info(`${result.messagesFoundCount} failures deleted`)
    req.body = { ...req.session.startIncentivesMigrationForm }
    this.postStartIncentiveMigration(req, res)
  }

  async postStartIncentiveMigrationPreview(req: Request, res: Response): Promise<void> {
    const filter = IncentivesMigrationController.toFilter(req.session.startIncentivesMigrationForm)

    const result = await this.nomisMigrationService.startIncentivesMigration(filter, context(res))
    req.session.startIncentivesMigrationForm.estimatedCount = result.estimatedCount.toLocaleString()
    req.session.startIncentivesMigrationForm.migrationId = result.migrationId
    res.redirect('/incentives-migration/start/confirmation')
  }

  async startIncentiveMigrationConfirmation(req: Request, res: Response): Promise<void> {
    res.render('pages/incentives/startIncentivesMigrationConfirmation', {
      form: req.session.startIncentivesMigrationForm,
    })
  }

  parseFilter(req: Request): MigrationViewFilter {
    return {
      toDateTime: req.query.toDateTime as string | undefined,
      fromDateTime: req.query.fromDateTime as string | undefined,
      includeOnlyFailures: (req.query.includeOnlyFailures as string) === 'true',
    }
  }

  private static messageApplicationInsightsQuery(message: { messageId: string }): string {
    return `exceptions
    | where cloud_RoleName == 'hmpps-prisoner-from-nomis-migration' 
    | where customDimensions.["Logger Message"] == "MessageID:${message.messageId}"
    | order by timestamp desc`
  }

  private static alreadyMigratedApplicationInsightsQuery(startedDate: string, endedDate: string): string {
    return `traces
    | where cloud_RoleName == 'hmpps-prisoner-from-nomis-migration' 
    | where message contains 'Will not migrate incentive since it is migrated already,'
    | where timestamp between (datetime(${IncentivesMigrationController.toISODateTime(
      startedDate
    )}) .. datetime(${IncentivesMigrationController.toISODateTime(endedDate)}))
    | summarize dcount(message)`
  }

  private static toISODateTime(localDateTime: string): string {
    return moment(localDateTime).toISOString()
  }

  private static applicationInsightsUrl(query: string): string {
    return buildUrl(query, 'P1D')
  }

  private static withFilter(migration: MigrationHistory): MigrationHistory & {
    filterToDate?: string
    filterFromDate?: string
  } {
    const filter: Filter = JSON.parse(migration.filter)
    const filterToDate = filter.toDate
    const filterFromDate = filter.fromDate
    return {
      ...migration,
      ...(filterToDate && { filterToDate }),
      ...(filterFromDate && { filterFromDate }),
    }
  }

  private static toFilter(form: StartIncentivesMigrationForm): IncentivesMigrationFilter {
    return {
      fromDate: form.fromDate,
      toDate: form.toDate,
    }
  }
}
