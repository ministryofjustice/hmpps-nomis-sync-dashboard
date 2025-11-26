import { Request, Response } from 'express'
import trimForm from '../../utils/trim'
import logger from '../../../logger'
import startMigrationValidator from './officialvisitsMigrationValidator'
import OfficialvisitsNomisMigrationService from '../../services/officialvisits/officialvisitsNomisMigrationService'
import OfficialvisitsNomisPrisonerService from '../../services/officialvisits/officialvisitsNomisPrisonerService'
import { context } from '../../services/context'
import NomisMigrationService from '../../services/nomisMigrationService'
import { alreadyMigratedLogAnalyticsLink, messageLogAnalyticsLink } from '../../utils/logAnalyticsUrlBuilder'

export default class OfficialvisitsMigrationController {
  constructor(
    private readonly officialvisitsNomisMigrationService: OfficialvisitsNomisMigrationService,
    private readonly nomisPrisonerService: OfficialvisitsNomisPrisonerService,
    private readonly nomisMigrationService: NomisMigrationService,
  ) {}

  private migrationType: string = 'OFFICIAL_VISITS'

  async getMigrations(_: Request, res: Response): Promise<void> {
    const { migrations } = await this.nomisMigrationService.getMigrationHistory(this.migrationType, context(res))

    const decoratedMigrations = migrations.map(history => ({
      ...history,
      applicationInsightsLink: alreadyMigratedLogAnalyticsLink(
        'Will not migrate the nomis official visit',
        history.whenStarted,
        history.whenEnded,
      ),
    }))
    res.render('pages/officialvisits/officialvisitsMigration', {
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
    res.render('pages/officialvisits/officialvisitsMigrationFailures', { failures: failuresDecorated })
  }

  async startNewMigration(req: Request, res: Response): Promise<void> {
    delete req.session.dateRangeAndPrisonFilterMigrationForm
    await this.startMigration(req, res)
  }

  async startMigration(req: Request, res: Response): Promise<void> {
    res.render('pages/officialvisits/startOfficialvisitsMigration', {
      form: req.session.dateRangeAndPrisonFilterMigrationForm,
      errors: req.flash('errors'),
    })
  }

  async postStartMigration(req: Request, res: Response): Promise<void> {
    req.session.dateRangeAndPrisonFilterMigrationForm = { ...trimForm(req.body) }

    const errors = startMigrationValidator(req.session.dateRangeAndPrisonFilterMigrationForm)

    if (errors.length > 0) {
      req.flash('errors', errors)
      res.redirect('/officialvisits-migration/amend')
    } else {
      const filter = req.session.dateRangeAndPrisonFilterMigrationForm
      const prisonIds = filter.prisonIds.split(',')
      const count = await this.nomisPrisonerService.getMigrationEstimatedCount(
        { prisonIds, fromDate: filter.fromDate, toDate: filter.toDate },
        context(res),
      )
      const dlqCountString = await this.nomisMigrationService.getFailureCount(this.migrationType, context(res))
      logger.info(`${dlqCountString} failures found`)

      req.session.dateRangeAndPrisonFilterMigrationForm.estimatedCount = count.toLocaleString()
      req.session.dateRangeAndPrisonFilterMigrationForm.dlqCount = dlqCountString.toLocaleString()
      res.redirect('/officialvisits-migration/start/preview')
    }
  }

  async startMigrationPreview(req: Request, res: Response): Promise<void> {
    res.render('pages/officialvisits/startOfficialvisitsMigrationPreview', {
      form: req.session.dateRangeAndPrisonFilterMigrationForm,
    })
  }

  async postClearDLQMigrationPreview(req: Request, res: Response): Promise<void> {
    const result = await this.nomisMigrationService.deleteFailures(this.migrationType, context(res))
    logger.info(`${result.messagesFoundCount} failures deleted`)
    req.body = { ...req.session.dateRangeAndPrisonFilterMigrationForm }
    await this.postStartMigration(req, res)
  }

  async postStartMigrationPreview(req: Request, res: Response): Promise<void> {
    const filter = req.session.dateRangeAndPrisonFilterMigrationForm
    const prisonIds = filter.prisonIds.split(',')
    const result = await this.officialvisitsNomisMigrationService.startMigration(
      { prisonIds, fromDate: filter.fromDate, toDate: filter.toDate },
      context(res),
    )
    req.session.dateRangeAndPrisonFilterMigrationForm.estimatedCount = result.estimatedCount.toLocaleString()
    req.session.dateRangeAndPrisonFilterMigrationForm.migrationId = result.migrationId
    res.redirect('/officialvisits-migration/start/confirmation')
  }

  async startMigrationConfirmation(req: Request, res: Response): Promise<void> {
    res.render('pages/officialvisits/startOfficialvisitsMigrationConfirmation', {
      form: req.session.dateRangeAndPrisonFilterMigrationForm,
    })
  }

  async migrationDetails(req: Request, res: Response): Promise<void> {
    const { migrationId } = req.query as { migrationId: string }
    const migration = await this.nomisMigrationService.getMigration(migrationId, context(res))
    res.render('pages/officialvisits/officialvisitsMigrationDetails', {
      migration: { ...migration, history: migration.history },
    })
  }

  async cancelMigration(req: Request, res: Response): Promise<void> {
    const { migrationId }: { migrationId: string } = req.body
    await this.nomisMigrationService.cancelMigration(migrationId, context(res))
    const migration = await this.nomisMigrationService.getMigration(migrationId, context(res))
    res.render('pages/officialvisits/officialvisitsMigrationDetails', {
      migration: { ...migration, history: migration.history },
    })
  }
}
