import { Request, Response } from 'express'
import { StartCSIPMigrationForm } from 'express-session'
import moment from 'moment'
import NomisMigrationService, { Context } from '../../services/nomisMigrationService'
import { MigrationHistory, CSIPMigrationFilter } from '../../@types/migration'
import { buildUrl } from '../../utils/applicationInsightsUrlBuilder'
import trimForm from '../../utils/trim'
import logger from '../../../logger'
import startCSIPMigrationValidator from './startCSIPMigrationValidator'
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

export default class CSIPMigrationController {
  constructor(
    private readonly nomisMigrationService: NomisMigrationService,
    private readonly nomisPrisonerService: NomisPrisonerService,
  ) {}

  async getCSIPMigrations(req: Request, res: Response): Promise<void> {
    const { migrations } = await this.nomisMigrationService.getCSIPMigrations(context(res))

    const decoratedMigrations = migrations.map(history => ({
      ...history,
      applicationInsightsLink: CSIPMigrationController.applicationInsightsUrl(
        CSIPMigrationController.alreadyMigratedApplicationInsightsQuery(history.whenStarted, history.whenEnded),
      ),
    }))
    res.render('pages/csip/csipMigration', {
      migrations: decoratedMigrations,
    })
  }

  async viewFailures(req: Request, res: Response): Promise<void> {
    const failures = await this.nomisMigrationService.getCSIPFailures(context(res))
    const failuresDecorated = {
      ...failures,
      messages: failures.messages.map(message => ({
        ...message,
        applicationInsightsLink: CSIPMigrationController.applicationInsightsUrl(
          CSIPMigrationController.messageApplicationInsightsQuery(message),
        ),
      })),
    }
    res.render('pages/csip/csipMigrationFailures', { failures: failuresDecorated })
  }

  async startNewCSIPMigration(req: Request, res: Response): Promise<void> {
    delete req.session.startCSIPMigrationForm
    await this.startCSIPMigration(req, res)
  }

  async startCSIPMigration(req: Request, res: Response): Promise<void> {
    res.render('pages/csip/startCSIPMigration', {
      form: req.session.startCSIPMigrationForm,
      errors: req.flash('errors'),
    })
  }

  async postStartCSIPMigration(req: Request, res: Response): Promise<void> {
    req.session.startCSIPMigrationForm = { ...trimForm(req.body) }

    const errors = startCSIPMigrationValidator(req.session.startCSIPMigrationForm)

    if (errors.length > 0) {
      req.flash('errors', errors)
      res.redirect('/csip-migration/amend')
    } else {
      const filter = CSIPMigrationController.toFilter(req.session.startCSIPMigrationForm)
      const count = await this.nomisPrisonerService.getCSIPMigrationEstimatedCount(filter, context(res))
      const dlqCountString = await this.nomisMigrationService.getCSIPDLQMessageCount(context(res))
      logger.info(`${dlqCountString} failures found`)

      req.session.startCSIPMigrationForm.estimatedCount = count.toLocaleString()
      req.session.startCSIPMigrationForm.dlqCount = dlqCountString.toLocaleString()
      res.redirect('/csip-migration/start/preview')
    }
  }

  async startCSIPMigrationPreview(req: Request, res: Response): Promise<void> {
    res.render('pages/csip/startCSIPMigrationPreview', { form: req.session.startCSIPMigrationForm })
  }

  async postClearDLQCSIPMigrationPreview(req: Request, res: Response): Promise<void> {
    const result = await this.nomisMigrationService.deleteCSIPFailures(context(res))
    logger.info(`${result.messagesFoundCount} failures deleted`)
    req.body = { ...req.session.startCSIPMigrationForm }
    await this.postStartCSIPMigration(req, res)
  }

  async postStartCSIPMigrationPreview(req: Request, res: Response): Promise<void> {
    const filter = CSIPMigrationController.toFilter(req.session.startCSIPMigrationForm)

    const result = await this.nomisMigrationService.startCSIPMigration(filter, context(res))
    req.session.startCSIPMigrationForm.estimatedCount = result.estimatedCount.toLocaleString()
    req.session.startCSIPMigrationForm.migrationId = result.migrationId
    res.redirect('/csip-migration/start/confirmation')
  }

  async startCSIPMigrationConfirmation(req: Request, res: Response): Promise<void> {
    res.render('pages/csip/startCSIPMigrationConfirmation', {
      form: req.session.startCSIPMigrationForm,
    })
  }

  async csipMigrationDetails(req: Request, res: Response): Promise<void> {
    const { migrationId } = req.query as { migrationId: string }
    const migration = await this.nomisMigrationService.getCSIPMigration(migrationId, context(res))
    res.render('pages/csip/csipMigrationDetails', {
      migration: { ...migration, history: CSIPMigrationController.withFilter(migration.history) },
    })
  }

  async cancelMigration(req: Request, res: Response): Promise<void> {
    const { migrationId }: { migrationId: string } = req.body
    await this.nomisMigrationService.cancelCSIPMigration(migrationId, context(res))
    const migration = await this.nomisMigrationService.getCSIPMigration(migrationId, context(res))
    res.render('pages/csip/csipMigrationDetails', {
      migration: { ...migration, history: CSIPMigrationController.withFilter(migration.history) },
    })
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
    | where message contains 'Will not migrate the adjustment since it is migrated already,'
    | where timestamp between (datetime(${CSIPMigrationController.toISODateTime(
      startedDate,
    )}) .. datetime(${CSIPMigrationController.toISODateTime(endedDate)}))
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

  private static toFilter(form: StartCSIPMigrationForm): CSIPMigrationFilter {
    return {
      fromDate: form.fromDate,
      toDate: form.toDate,
    }
  }
}
