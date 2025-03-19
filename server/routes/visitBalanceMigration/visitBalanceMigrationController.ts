import { Request, Response } from 'express'
import moment from 'moment'
import { buildUrl } from '../../utils/logAnalyticsUrlBuilder'
import trimForm from '../../utils/trim'
import logger from '../../../logger'
import startMigrationValidator from './visitBalanceMigrationValidator'
import VisitBalanceNomisMigrationService from '../../services/visitbalance/visitBalanceNomisMigrationService'
import VisitBalanceNomisPrisonerService from '../../services/visitbalance/visitBalanceNomisPrisonerService'
import { Context } from '../../services/nomisMigrationService'
import { MigrationHistory } from '../../@types/migration'

interface Filter {
  prisonId?: string
}

function context(res: Response): Context {
  return {
    username: res?.locals?.user?.username,
    token: res?.locals?.user?.token,
  }
}

export default class VisitBalanceMigrationController {
  constructor(
    private readonly nomisMigrationService: VisitBalanceNomisMigrationService,
    private readonly nomisPrisonerService: VisitBalanceNomisPrisonerService,
  ) {}

  async getMigrations(req: Request, res: Response): Promise<void> {
    const { migrations } = await this.nomisMigrationService.getMigrations(context(res))

    const decoratedMigrations = migrations.map(VisitBalanceMigrationController.withFilter).map(history => ({
      ...history,
      applicationInsightsLink: VisitBalanceMigrationController.applicationInsightsUrl(
        VisitBalanceMigrationController.alreadyMigratedApplicationInsightsQuery(history.whenStarted, history.whenEnded),
      ),
    }))
    res.render('pages/visitbalance/visitBalanceMigration', {
      migrations: decoratedMigrations,
    })
  }

  async viewFailures(req: Request, res: Response): Promise<void> {
    const failures = await this.nomisMigrationService.getFailures(context(res))
    const failuresDecorated = {
      ...failures,
      messages: failures.messages.map(message => ({
        ...message,
        applicationInsightsLink: VisitBalanceMigrationController.applicationInsightsUrl(
          VisitBalanceMigrationController.messageApplicationInsightsQuery(message),
        ),
      })),
    }
    res.render('pages/visitbalance/visitBalanceMigrationFailures', { failures: failuresDecorated })
  }

  async startNewMigration(req: Request, res: Response): Promise<void> {
    delete req.session.prisonFilteredMigrationForm
    await this.startMigration(req, res)
  }

  async startMigration(req: Request, res: Response): Promise<void> {
    res.render('pages/visitbalance/startVisitBalanceMigration', {
      form: req.session.prisonFilteredMigrationForm,
      errors: req.flash('errors'),
    })
  }

  async postStartMigration(req: Request, res: Response): Promise<void> {
    req.session.prisonFilteredMigrationForm = { ...trimForm(req.body) }

    const errors = startMigrationValidator(req.session.prisonFilteredMigrationForm)

    if (errors.length > 0) {
      req.flash('errors', errors)
      res.redirect('/visit-balance-migration/amend')
    } else {
      const filter = req.session.prisonFilteredMigrationForm
      const count = await this.nomisPrisonerService.getMigrationEstimatedCount(filter, context(res))
      const dlqCountString = await this.nomisMigrationService.getDLQMessageCount(context(res))
      logger.info(`${dlqCountString} failures found`)

      req.session.prisonFilteredMigrationForm.estimatedCount = count.toLocaleString()
      req.session.prisonFilteredMigrationForm.dlqCount = dlqCountString.toLocaleString()
      res.redirect('/visit-balance-migration/start/preview')
    }
  }

  async startMigrationPreview(req: Request, res: Response): Promise<void> {
    res.render('pages/visitbalance/startVisitBalanceMigrationPreview', {
      form: req.session.prisonFilteredMigrationForm,
    })
  }

  async postClearDLQMigrationPreview(req: Request, res: Response): Promise<void> {
    const result = await this.nomisMigrationService.deleteFailures(context(res))
    logger.info(`${result.messagesFoundCount} failures deleted`)
    req.body = { ...req.session.prisonFilteredMigrationForm }
    await this.postStartMigration(req, res)
  }

  async postStartMigrationPreview(req: Request, res: Response): Promise<void> {
    const filter = req.session.prisonFilteredMigrationForm
    const result = await this.nomisMigrationService.startMigration(filter, context(res))
    req.session.prisonFilteredMigrationForm.estimatedCount = result.estimatedCount.toLocaleString()
    req.session.prisonFilteredMigrationForm.migrationId = result.migrationId
    res.redirect('/visit-balance-migration/start/confirmation')
  }

  async startMigrationConfirmation(req: Request, res: Response): Promise<void> {
    res.render('pages/visitbalance/startVisitBalanceMigrationConfirmation', {
      form: req.session.prisonFilteredMigrationForm,
    })
  }

  async migrationDetails(req: Request, res: Response): Promise<void> {
    const { migrationId } = req.query as { migrationId: string }
    const migration = await this.nomisMigrationService.getMigration(migrationId, context(res))
    res.render('pages/visitbalance/visitBalanceMigrationDetails', {
      migration: { ...migration, history: VisitBalanceMigrationController.withFilter(migration.history) },
    })
  }

  async cancelMigration(req: Request, res: Response): Promise<void> {
    const { migrationId }: { migrationId: string } = req.body
    await this.nomisMigrationService.cancelMigration(migrationId, context(res))
    const migration = await this.nomisMigrationService.getMigration(migrationId, context(res))
    res.render('pages/visitbalance/visitBalanceMigrationDetails', {
      migration: { ...migration, history: VisitBalanceMigrationController.withFilter(migration.history) },
    })
  }

  private static messageApplicationInsightsQuery(message: { messageId: string }): string {
    return `AppExceptions
| where AppRoleName == 'hmpps-prisoner-from-nomis-migration'
| where Properties.["Logger Message"] == "MessageID:${message.messageId}"
| order by TimeGenerated desc`
  }

  private static alreadyMigratedApplicationInsightsQuery(startedDate: string, endedDate: string): string {
    return `AppTraces
| where AppRoleName == 'hmpps-prisoner-from-nomis-migration'
| where Message contains 'Will not migrate the nomis visit balance'
| where TimeGenerated between (datetime(${VisitBalanceMigrationController.toISODateTime(
      startedDate,
    )}) .. datetime(${VisitBalanceMigrationController.toISODateTime(endedDate)}))
| summarize dcount(Message)`
  }

  private static toISODateTime(localDateTime: string): string {
    return moment(localDateTime).toISOString()
  }

  private static applicationInsightsUrl(query: string): string {
    return buildUrl(query, 'P1D')
  }

  private static withFilter(migration: MigrationHistory): MigrationHistory & {
    filterPrisonId?: string
  } {
    const filter: Filter = JSON.parse(migration.filter)
    const filterPrisonId = filter.prisonId
    return {
      ...migration,
      ...(filterPrisonId && { filterPrisonId }),
    }
  }
}
