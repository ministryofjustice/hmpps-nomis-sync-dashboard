import { Request, Response } from 'express'
import { StartSentencingMigrationForm } from 'express-session'
import moment from 'moment'
import NomisMigrationService, { Context } from '../../services/nomisMigrationService'
import { SentencingMigrationFilter, MigrationHistory } from '../../@types/migration'
import { MigrationViewFilter } from '../../@types/dashboard'
import buildUrl from '../../utils/applicationInsightsUrlBuilder'
import sentencingMigrationValidator from './sentencingMigrationValidator'
import { withDefaultTime } from '../../utils/utils'
import trimForm from '../../utils/trim'
import logger from '../../../logger'
import startSentencingMigrationValidator from './startSentencingMigrationValidator'
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

export default class SentencingMigrationController {
  constructor(
    private readonly nomisMigrationService: NomisMigrationService,
    private readonly nomisPrisonerService: NomisPrisonerService,
  ) {}

  async getSentencingMigrations(req: Request, res: Response): Promise<void> {
    const searchFilter = this.parseFilter(req)

    const errors = sentencingMigrationValidator(searchFilter)

    if (errors.length > 0) {
      res.render('pages/sentencing/sentencingMigration', {
        errors,
        migrationViewFilter: searchFilter,
      })
    } else {
      const { migrations } = await this.nomisMigrationService.getSentencingMigrations(context(res), {
        ...searchFilter,
        toDateTime: withDefaultTime(searchFilter.toDateTime),
        fromDateTime: withDefaultTime(searchFilter.fromDateTime),
      })

      const decoratedMigrations = migrations.map(SentencingMigrationController.withFilter).map(history => ({
        ...history,
        applicationInsightsLink: SentencingMigrationController.applicationInsightsUrl(
          SentencingMigrationController.alreadyMigratedApplicationInsightsQuery(history.whenStarted, history.whenEnded),
        ),
      }))
      res.render('pages/sentencing/sentencingMigration', {
        migrations: decoratedMigrations,
        migrationViewFilter: searchFilter,
        errors: [],
      })
    }
  }

  async viewFailures(req: Request, res: Response): Promise<void> {
    const failures = await this.nomisMigrationService.getSentencingFailures(context(res))
    const failuresDecorated = {
      ...failures,
      messages: failures.messages.map(message => ({
        ...message,
        applicationInsightsLink: SentencingMigrationController.applicationInsightsUrl(
          SentencingMigrationController.messageApplicationInsightsQuery(message),
        ),
      })),
    }
    res.render('pages/sentencing/sentencingMigrationFailures', { failures: failuresDecorated })
  }

  async startNewSentencingMigration(req: Request, res: Response): Promise<void> {
    delete req.session.startSentencingMigrationForm
    await this.startSentencingMigration(req, res)
  }

  async startSentencingMigration(req: Request, res: Response): Promise<void> {
    res.render('pages/sentencing/startSentencingMigration', {
      form: req.session.startSentencingMigrationForm,
      errors: req.flash('errors'),
    })
  }

  async postStartSentencingMigration(req: Request, res: Response): Promise<void> {
    req.session.startSentencingMigrationForm = { ...trimForm(req.body) }

    const errors = startSentencingMigrationValidator(req.session.startSentencingMigrationForm)

    if (errors.length > 0) {
      req.flash('errors', errors)
      res.redirect('/sentencing-migration/amend')
    } else {
      const filter = SentencingMigrationController.toFilter(req.session.startSentencingMigrationForm)
      const count = await this.nomisPrisonerService.getSentencingMigrationEstimatedCount(filter, context(res))
      const dlqCountString = await this.nomisMigrationService.getSentencingDLQMessageCount(context(res))
      logger.info(`${dlqCountString} failures found`)

      req.session.startSentencingMigrationForm.estimatedCount = count.toLocaleString()
      req.session.startSentencingMigrationForm.dlqCount = dlqCountString.toLocaleString()
      res.redirect('/sentencing-migration/start/preview')
    }
  }

  async startSentencingMigrationPreview(req: Request, res: Response): Promise<void> {
    res.render('pages/sentencing/startSentencingMigrationPreview', { form: req.session.startSentencingMigrationForm })
  }

  async postClearDLQSentencingMigrationPreview(req: Request, res: Response): Promise<void> {
    const result = await this.nomisMigrationService.deleteSentencingFailures(context(res))
    logger.info(`${result.messagesFoundCount} failures deleted`)
    req.body = { ...req.session.startSentencingMigrationForm }
    await this.postStartSentencingMigration(req, res)
  }

  async postStartSentencingMigrationPreview(req: Request, res: Response): Promise<void> {
    const filter = SentencingMigrationController.toFilter(req.session.startSentencingMigrationForm)

    const result = await this.nomisMigrationService.startSentencingMigration(filter, context(res))
    req.session.startSentencingMigrationForm.estimatedCount = result.estimatedCount.toLocaleString()
    req.session.startSentencingMigrationForm.migrationId = result.migrationId
    res.redirect('/sentencing-migration/start/confirmation')
  }

  async startSentencingMigrationConfirmation(req: Request, res: Response): Promise<void> {
    res.render('pages/sentencing/startSentencingMigrationConfirmation', {
      form: req.session.startSentencingMigrationForm,
    })
  }

  async sentencingMigrationDetails(req: Request, res: Response): Promise<void> {
    const { migrationId } = req.query as { migrationId: string }
    const migration = await this.nomisMigrationService.getSentencingMigration(migrationId, context(res))
    res.render('pages/sentencing/sentencingMigrationDetails', {
      migration: { ...migration, history: SentencingMigrationController.withFilter(migration.history) },
    })
  }

  async cancelMigration(req: Request, res: Response): Promise<void> {
    const { migrationId }: { migrationId: string } = req.body
    await this.nomisMigrationService.cancelSentencingMigration(migrationId, context(res))
    const migration = await this.nomisMigrationService.getSentencingMigration(migrationId, context(res))
    res.render('pages/sentencing/sentencingMigrationDetails', {
      migration: { ...migration, history: SentencingMigrationController.withFilter(migration.history) },
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
    | where message contains 'Will not migrate sentencing adjustment since it is migrated already,'
    | where timestamp between (datetime(${SentencingMigrationController.toISODateTime(
      startedDate,
    )}) .. datetime(${SentencingMigrationController.toISODateTime(endedDate)}))
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

  private static toFilter(form: StartSentencingMigrationForm): SentencingMigrationFilter {
    return {
      fromDate: form.fromDate,
      toDate: form.toDate,
    }
  }
}
