import { Request, Response } from 'express'
import logger from '../../../logger'
import VisitslotsNomisMigrationService from '../../services/visitslots/visitslotsNomisMigrationService'
import VisitslotsNomisPrisonerService from '../../services/visitslots/visitslotsNomisPrisonerService'
import { context } from '../../services/context'
import NomisMigrationService from '../../services/nomisMigrationService'
import { alreadyMigratedLogAnalyticsLink, messageLogAnalyticsLink } from '../../utils/logAnalyticsUrlBuilder'
import trimForm from '../../utils/trim'

export default class VisitslotsMigrationController {
  constructor(
    private readonly visitslotsNomisMigrationService: VisitslotsNomisMigrationService,
    private readonly visitslotsNomisPrisonerService: VisitslotsNomisPrisonerService,
    private readonly nomisMigrationService: NomisMigrationService,
  ) {}

  private migrationType: string = 'VISIT_SLOTS'

  async getMigrations(_: Request, res: Response): Promise<void> {
    const { migrations } = await this.nomisMigrationService.getMigrationHistory(this.migrationType, context(res))

    const decoratedMigrations = migrations.map(history => ({
      ...history,
      applicationInsightsLink: alreadyMigratedLogAnalyticsLink(
        'Will not migrate the nomis visit time slot',
        history.whenStarted,
        history.whenEnded,
      ),
    }))
    res.render('pages/visitslots/visitslotsMigration', {
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
    res.render('pages/visitslots/visitslotsMigrationFailures', { failures: failuresDecorated })
  }

  async startNewMigration(req: Request, res: Response): Promise<void> {
    delete req.session.noFilterMigrationForm
    await this.startMigration(req, res)
  }

  async startMigration(req: Request, res: Response): Promise<void> {
    res.render('pages/visitslots/startVisitslotsMigration', {
      form: req.session.noFilterMigrationForm,
      errors: req.flash('errors'),
    })
  }

  async postStartMigration(req: Request, res: Response): Promise<void> {
    req.session.noFilterMigrationForm = { ...trimForm(req.body) }
    const count = await this.visitslotsNomisPrisonerService.getMigrationEstimatedCount(context(res))
    const dlqCountString = await this.nomisMigrationService.getFailureCount(this.migrationType, context(res))
    logger.info(`${dlqCountString} failures found`)

    req.session.noFilterMigrationForm.estimatedCount = count.toLocaleString()
    req.session.noFilterMigrationForm.dlqCount = dlqCountString.toLocaleString()
    res.redirect('/visitslots-migration/start/preview')
  }

  async startMigrationPreview(req: Request, res: Response): Promise<void> {
    res.render('pages/visitslots/startVisitslotsMigrationPreview', {
      form: req.session.noFilterMigrationForm,
    })
  }

  async postClearDLQMigrationPreview(req: Request, res: Response): Promise<void> {
    const result = await this.nomisMigrationService.deleteFailures(this.migrationType, context(res))
    logger.info(`${result.messagesFoundCount} failures deleted`)
    req.body = { ...req.session.noFilterMigrationForm }
    await this.postStartMigration(req, res)
  }

  async postStartMigrationPreview(req: Request, res: Response): Promise<void> {
    const result = await this.visitslotsNomisMigrationService.startMigration(context(res))
    req.session.noFilterMigrationForm.estimatedCount = result.estimatedCount.toLocaleString()
    req.session.noFilterMigrationForm.migrationId = result.migrationId
    res.redirect('/visitslots-migration/start/confirmation')
  }

  async startMigrationConfirmation(req: Request, res: Response): Promise<void> {
    res.render('pages/visitslots/startVisitslotsMigrationConfirmation', {
      form: req.session.noFilterMigrationForm,
    })
  }

  async migrationDetails(req: Request, res: Response): Promise<void> {
    const { migrationId } = req.query as { migrationId: string }
    const migration = await this.nomisMigrationService.getMigration(migrationId, context(res))
    res.render('pages/visitslots/visitslotsMigrationDetails', {
      migration: { ...migration, history: migration.history },
    })
  }

  async cancelMigration(req: Request, res: Response): Promise<void> {
    const { migrationId }: { migrationId: string } = req.body
    await this.nomisMigrationService.cancelMigration(migrationId, context(res))
    const migration = await this.nomisMigrationService.getMigration(migrationId, context(res))
    res.render('pages/visitslots/visitslotsMigrationDetails', {
      migration: { ...migration, history: migration.history },
    })
  }
}
