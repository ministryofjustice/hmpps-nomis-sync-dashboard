import { Request, Response } from 'express'
import { StartAlertsMigrationForm } from 'express-session'
import moment from 'moment'
import NomisMigrationService, { Context } from '../../services/nomisMigrationService'
import { MigrationHistory, AlertsMigrationFilter } from '../../@types/migration'
import buildUrl from '../../utils/applicationInsightsUrlBuilder'
import trimForm from '../../utils/trim'
import logger from '../../../logger'
import startAlertsMigrationValidator from './startAlertsMigrationValidator'
import NomisPrisonerService from '../../services/nomisPrisonerService'

interface Filter {
  prisonIds?: string[]
  fromDate?: string
  toDate?: string
}

function context(res: Response): Context {
  return {
    username: res?.locals?.user?.username,
    token: res?.locals?.user?.token,
  }
}

export default class AlertsMigrationController {
  constructor(
    private readonly nomisMigrationService: NomisMigrationService,
    private readonly nomisPrisonerService: NomisPrisonerService,
  ) {}

  async getAlertsMigrations(req: Request, res: Response): Promise<void> {
    const { migrations } = await this.nomisMigrationService.getAlertsMigrations(context(res))

    const decoratedMigrations = migrations.map(AlertsMigrationController.withFilter).map(history => ({
      ...history,
      applicationInsightsLink: AlertsMigrationController.applicationInsightsUrl(
        AlertsMigrationController.alreadyMigratedApplicationInsightsQuery(history.whenStarted, history.whenEnded),
      ),
    }))
    res.render('pages/alerts/alertsMigration', {
      migrations: decoratedMigrations,
      errors: [],
    })
  }

  async startNewAlertsMigration(req: Request, res: Response): Promise<void> {
    delete req.session.startAlertsMigrationForm
    await this.startAlertsMigration(req, res)
  }

  async startAlertsMigration(req: Request, res: Response): Promise<void> {
    res.render('pages/alerts/startAlertsMigration', {
      form: req.session.startAlertsMigrationForm,
      errors: req.flash('errors'),
    })
  }

  async postStartAlertsMigration(req: Request, res: Response): Promise<void> {
    req.session.startAlertsMigrationForm = { ...trimForm(req.body) }

    const errors = startAlertsMigrationValidator(req.session.startAlertsMigrationForm)

    if (errors.length > 0) {
      req.flash('errors', errors)
      res.redirect('/alerts-migration/amend')
    } else {
      const filter = AlertsMigrationController.toFilter(req.session.startAlertsMigrationForm)
      const count = await this.nomisPrisonerService.getAlertsMigrationEstimatedCount(filter, context(res))
      const dlqCountString = await this.nomisMigrationService.getAlertsDLQMessageCount(context(res))
      logger.info(`${dlqCountString} failures found`)

      req.session.startAlertsMigrationForm.estimatedCount = count.toLocaleString()
      req.session.startAlertsMigrationForm.dlqCount = dlqCountString.toLocaleString()
      res.redirect('/alerts-migration/start/preview')
    }
  }

  async startAlertsMigrationPreview(req: Request, res: Response): Promise<void> {
    res.render('pages/alerts/startAlertsMigrationPreview', {
      form: req.session.startAlertsMigrationForm,
    })
  }

  async postClearDLQAlertsMigrationPreview(req: Request, res: Response): Promise<void> {
    const result = await this.nomisMigrationService.deleteAlertsFailures(context(res))
    logger.info(`${result.messagesFoundCount} failures deleted`)
    req.body = { ...req.session.startAlertsMigrationForm }
    await this.postStartAlertsMigration(req, res)
  }

  async postStartAlertsMigrationPreview(req: Request, res: Response): Promise<void> {
    const filter = AlertsMigrationController.toFilter(req.session.startAlertsMigrationForm)

    const result = await this.nomisMigrationService.startAlertsMigration(filter, context(res))
    req.session.startAlertsMigrationForm.estimatedCount = result.estimatedCount.toLocaleString()
    req.session.startAlertsMigrationForm.migrationId = result.migrationId
    res.redirect('/alerts-migration/start/confirmation')
  }

  async startAlertsMigrationConfirmation(req: Request, res: Response): Promise<void> {
    res.render('pages/alerts/startAlertsMigrationConfirmation', {
      form: req.session.startAlertsMigrationForm,
    })
  }

  async alertsMigrationDetails(req: Request, res: Response): Promise<void> {
    const { migrationId } = req.query as { migrationId: string }
    const migration = await this.nomisMigrationService.getAlertsMigration(migrationId, context(res))
    res.render('pages/alerts/alertsMigrationDetails', {
      migration: { ...migration, history: AlertsMigrationController.withFilter(migration.history) },
    })
  }

  async viewFailures(req: Request, res: Response): Promise<void> {
    const failures = await this.nomisMigrationService.getAlertsFailures(context(res))
    const failuresDecorated = {
      ...failures,
      messages: failures.messages.map(message => ({
        ...message,
        applicationInsightsLink: AlertsMigrationController.applicationInsightsUrl(
          AlertsMigrationController.messageApplicationInsightsQuery(message),
        ),
      })),
    }
    res.render('pages/alerts/alertsMigrationFailures', { failures: failuresDecorated })
  }

  async cancelMigration(req: Request, res: Response): Promise<void> {
    const { migrationId }: { migrationId: string } = req.body
    await this.nomisMigrationService.cancelAlertsMigration(migrationId, context(res))
    const migration = await this.nomisMigrationService.getAlertsMigration(migrationId, context(res))
    res.render('pages/alerts/alertsMigrationDetails', {
      migration: { ...migration, history: AlertsMigrationController.withFilter(migration.history) },
    })
  }

  private static toFilter(form: StartAlertsMigrationForm): AlertsMigrationFilter {
    return {
      fromDate: form.fromDate,
      toDate: form.toDate,
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
    | where message contains 'Will not migrate the alert since it is migrated already,'
    | where timestamp between (datetime(${AlertsMigrationController.toISODateTime(
      startedDate,
    )}) .. datetime(${AlertsMigrationController.toISODateTime(endedDate)}))
    | summarize dcount(message)`
  }

  private static toISODateTime(localDateTime: string): string {
    return moment(localDateTime).toISOString()
  }

  private static applicationInsightsUrl(query: string): string {
    return buildUrl(query, 'P1D')
  }

  private static withFilter(migration: MigrationHistory): MigrationHistory & {
    filterPrisonIds?: string
    filterToDate?: string
    filterFromDate?: string
  } {
    const filter: Filter = JSON.parse(migration.filter)
    const filterPrisonIds = filter.prisonIds?.join()
    const filterToDate = filter.toDate
    const filterFromDate = filter.fromDate
    return {
      ...migration,
      ...(filterPrisonIds && { filterPrisonIds }),
      ...(filterToDate && { filterToDate }),
      ...(filterFromDate && { filterFromDate }),
    }
  }
}
