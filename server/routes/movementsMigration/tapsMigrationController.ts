import { Request, Response } from 'express'
import moment from 'moment/moment'
import trimForm from '../../utils/trim'
import logger from '../../../logger'
import { context } from '../../services/context'
import NomisMigrationService from '../../services/nomisMigrationService'
import { buildUrlNoTimespan } from '../../utils/logAnalyticsUrlBuilder'
import MovementsNomisPrisonerService from '../../services/movements/movementsNomisPrisonerService'
import TapsNomisMigrationService from '../../services/movements/tapsNomisMigrationService'
import { MigrationHistory } from '../../@types/migration'

interface Filter {
  prisonerNumber?: string
}

export default class TapsMigrationController {
  constructor(
    private readonly tapsNomisMigrationService: TapsNomisMigrationService,
    private readonly movementsNomisPrisonerService: MovementsNomisPrisonerService,
    private readonly nomisMigrationService: NomisMigrationService,
  ) {}

  private migrationType: string = 'EXTERNAL_MOVEMENTS'

  async getMigrations(_: Request, res: Response): Promise<void> {
    const { migrations } = await this.nomisMigrationService.getMigrationHistory(this.migrationType, context(res))

    const decoratedMigrations = migrations.map(TapsMigrationController.withFilter).map(history => ({
      ...history,
      applicationInsightsAllLink: TapsMigrationController.applicationInsightsUrl(
        TapsMigrationController.migrationsApplicationInsightsQuery(
          history.migrationId,
          history.whenStarted,
          history.whenEnded,
          false,
        ),
      ),
      applicationInsightsFailuresLink: TapsMigrationController.applicationInsightsUrl(
        TapsMigrationController.migrationsApplicationInsightsQuery(
          history.migrationId,
          history.whenStarted,
          history.whenEnded,
          true,
        ),
      ),
    }))
    res.render('pages/taps/tapsMigration', {
      migrations: decoratedMigrations,
    })
  }

  async startNewMigration(req: Request, res: Response): Promise<void> {
    delete req.session.prisonerFilteredMigrationForm
    await this.startMigration(req, res)
  }

  async startMigration(req: Request, res: Response): Promise<void> {
    res.render('pages/taps/startTapsMigration', {
      form: req.session.prisonerFilteredMigrationForm,
      errors: req.flash('errors'),
    })
  }

  async postStartMigration(req: Request, res: Response): Promise<void> {
    req.session.prisonerFilteredMigrationForm = { ...trimForm(req.body) }

    const filter = req.session.prisonerFilteredMigrationForm
    const count = await this.movementsNomisPrisonerService.getMigrationEstimatedCount(filter, context(res))
    const dlqCountString = await this.nomisMigrationService.getFailureCount(this.migrationType, context(res))
    logger.info(`${dlqCountString} failures found`)

    req.session.prisonerFilteredMigrationForm.estimatedCount = count.toLocaleString()
    req.session.prisonerFilteredMigrationForm.dlqCount = dlqCountString.toLocaleString()
    res.redirect('/taps-migration/start/preview')
  }

  async startMigrationPreview(req: Request, res: Response): Promise<void> {
    res.render('pages/taps/startTapsMigrationPreview', {
      form: req.session.prisonerFilteredMigrationForm,
    })
  }

  async postClearDLQMigrationPreview(req: Request, res: Response): Promise<void> {
    const result = await this.nomisMigrationService.deleteFailures(this.migrationType, context(res))
    logger.info(`${result.messagesFoundCount} failures deleted`)
    req.body = { ...req.session.prisonerFilteredMigrationForm }
    await this.postStartMigration(req, res)
  }

  async postStartMigrationPreview(req: Request, res: Response): Promise<void> {
    const filter = req.session.prisonerFilteredMigrationForm
    const result = await this.tapsNomisMigrationService.startMigration(filter, context(res))
    req.session.prisonerFilteredMigrationForm.estimatedCount = result.estimatedCount.toLocaleString()
    req.session.prisonerFilteredMigrationForm.migrationId = result.migrationId
    res.redirect('/taps-migration/start/confirmation')
  }

  async startMigrationConfirmation(req: Request, res: Response): Promise<void> {
    res.render('pages/taps/startTapsMigrationConfirmation', {
      form: req.session.prisonerFilteredMigrationForm,
    })
  }

  async migrationDetails(req: Request, res: Response): Promise<void> {
    const { migrationId } = req.query as { migrationId: string }
    const migration = await this.nomisMigrationService.getMigration(migrationId, context(res))
    res.render('pages/taps/tapsMigrationDetails', {
      migration: { ...migration, history: migration.history },
    })
  }

  async cancelMigration(req: Request, res: Response): Promise<void> {
    const { migrationId }: { migrationId: string } = req.body
    await this.nomisMigrationService.cancelMigration(migrationId, context(res))
    const migration = await this.nomisMigrationService.getMigration(migrationId, context(res))
    res.render('pages/taps/tapsMigrationDetails', {
      migration: { ...migration, history: migration.history },
    })
  }

  private static migrationsApplicationInsightsQuery(
    migrationId: string,
    startedDate: string,
    endedDate?: string,
    failed: boolean = false,
  ): string {
    const startDateQuery = `datetime(${this.toISODateTime(startedDate)})`
    const endDateQuery = endedDate ? `datetime(${this.toISODateTime(endedDate)})` : `now()`
    const failedQuery = failed ? '| where (Name endswith "failed" or Name endswith "error")' : ''
    return `AppEvents
      | where AppRoleName == 'hmpps-prisoner-from-nomis-migration'
      | where TimeGenerated between (${startDateQuery} .. ${endDateQuery})
      | where Properties.migrationId startswith '${migrationId}'
      | where Name startswith 'temporary-absences-migration'
      ${failedQuery}
    `
  }

  private static toISODateTime(localDateTime: string): string {
    return moment(localDateTime).toISOString()
  }

  private static applicationInsightsUrl(query: string): string {
    return buildUrlNoTimespan(query)
  }

  private static withFilter(migration: MigrationHistory): MigrationHistory & {
    filterPrisonerNumber?: string
  } {
    const filter: Filter = JSON.parse(migration.filter)
    const filterPrisonerNumber = filter.prisonerNumber
    return {
      ...migration,
      ...(filterPrisonerNumber && { filterPrisonerNumber }),
    }
  }
}
