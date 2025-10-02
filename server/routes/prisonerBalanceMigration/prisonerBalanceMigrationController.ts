import { Request, Response } from 'express'
import { alreadyMigratedLogAnalyticsLink, messageLogAnalyticsLink } from '../../utils/logAnalyticsUrlBuilder'
import trimForm from '../../utils/trim'
import logger from '../../../logger'
import startMigrationValidator from './prisonerBalanceMigrationValidator'
import PrisonerBalanceNomisMigrationService from '../../services/finance/prisonerBalanceNomisMigrationService'
import { context } from '../../services/context'
import NomisMigrationService from '../../services/nomisMigrationService'
import { MigrationHistory } from '../../@types/migration'
import PrisonerBalanceNomisPrisonerService from '../../services/finance/prisonerBalanceNomisPrisonerService'

interface Filter {
  prisonId?: string
}

export default class PrisonerBalanceMigrationController {
  constructor(
    private readonly prisonerBalanceMigrationService: PrisonerBalanceNomisMigrationService,
    private readonly nomisPrisonerService: PrisonerBalanceNomisPrisonerService,
    private readonly nomisMigrationService: NomisMigrationService,
  ) {}

  private migrationType: string = 'PRISONER_BALANCE'

  async getMigrations(_: Request, res: Response): Promise<void> {
    const { migrations } = await this.nomisMigrationService.getMigrationHistory(this.migrationType, context(res))

    const decoratedMigrations = migrations.map(PrisonerBalanceMigrationController.withFilter).map(history => ({
      ...history,
      applicationInsightsLink: alreadyMigratedLogAnalyticsLink(
        'Will not migrate the nomis prisoner balance',
        history.whenStarted,
        history.whenEnded,
      ),
    }))
    res.render('pages/prisonerbalance/prisonerBalanceMigration', {
      migrations: decoratedMigrations,
    })
  }

  async viewFailures(_: Request, res: Response): Promise<void> {
    const failures = await this.nomisMigrationService.getFailures(this.migrationType, context(res))
    const failuresDecorated = {
      ...failures,
      messages: failures.messages.map(message => ({
        ...message,
        applicationInsightsLink: messageLogAnalyticsLink(message),
      })),
    }
    res.render('pages/prisonerbalance/prisonerBalanceMigrationFailures', { failures: failuresDecorated })
  }

  async startNewMigration(req: Request, res: Response): Promise<void> {
    delete req.session.prisonFilteredMigrationForm
    await this.startMigration(req, res)
  }

  async startMigration(req: Request, res: Response): Promise<void> {
    res.render('pages/prisonerbalance/startPrisonerBalanceMigration', {
      form: req.session.prisonFilteredMigrationForm,
      errors: req.flash('errors'),
    })
  }

  async postStartMigration(req: Request, res: Response): Promise<void> {
    req.session.prisonFilteredMigrationForm = { ...trimForm(req.body) }

    const errors = startMigrationValidator(req.session.prisonFilteredMigrationForm)

    if (errors.length > 0) {
      req.flash('errors', errors)
      res.redirect('/prisoner-balance-migration/amend')
    } else {
      const filter = req.session.prisonFilteredMigrationForm
      const count = await this.nomisPrisonerService.getMigrationEstimatedCount(filter, context(res))
      const dlqCountString = await this.nomisMigrationService.getFailureCount(this.migrationType, context(res))
      logger.info(`${dlqCountString} failures found`)

      req.session.prisonFilteredMigrationForm.estimatedCount = count.toLocaleString()
      req.session.prisonFilteredMigrationForm.dlqCount = dlqCountString.toLocaleString()
      res.redirect('/prisoner-balance-migration/start/preview')
    }
  }

  async startMigrationPreview(req: Request, res: Response): Promise<void> {
    res.render('pages/prisonerbalance/startPrisonerBalanceMigrationPreview', {
      form: req.session.prisonFilteredMigrationForm,
    })
  }

  async postClearDLQMigrationPreview(req: Request, res: Response): Promise<void> {
    const result = await this.nomisMigrationService.deleteFailures(this.migrationType, context(res))
    logger.info(`${result.messagesFoundCount} failures deleted`)
    req.body = { ...req.session.prisonFilteredMigrationForm }
    await this.postStartMigration(req, res)
  }

  async postStartMigrationPreview(req: Request, res: Response): Promise<void> {
    const filter = req.session.prisonFilteredMigrationForm
    const result = await this.prisonerBalanceMigrationService.startMigration(filter, context(res))
    req.session.prisonFilteredMigrationForm.estimatedCount = result.estimatedCount.toLocaleString()
    req.session.prisonFilteredMigrationForm.migrationId = result.migrationId
    res.redirect('/prisoner-balance-migration/start/confirmation')
  }

  async startMigrationConfirmation(req: Request, res: Response): Promise<void> {
    res.render('pages/prisonerbalance/startPrisonerBalanceMigrationConfirmation', {
      form: req.session.prisonFilteredMigrationForm,
    })
  }

  async migrationDetails(req: Request, res: Response): Promise<void> {
    const { migrationId } = req.query as { migrationId: string }
    const migration = await this.nomisMigrationService.getMigration(migrationId, context(res))
    res.render('pages/prisonerbalance/prisonerBalanceMigrationDetails', {
      migration: { ...migration, history: PrisonerBalanceMigrationController.withFilter(migration.history) },
    })
  }

  async cancelMigration(req: Request, res: Response): Promise<void> {
    const { migrationId }: { migrationId: string } = req.body
    await this.nomisMigrationService.cancelMigration(migrationId, context(res))
    const migration = await this.nomisMigrationService.getMigration(migrationId, context(res))
    res.render('pages/prisonerbalance/prisonerBalanceMigrationDetails', {
      migration: { ...migration, history: PrisonerBalanceMigrationController.withFilter(migration.history) },
    })
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
