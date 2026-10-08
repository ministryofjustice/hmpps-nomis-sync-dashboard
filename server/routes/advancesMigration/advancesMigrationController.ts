import { Request, Response } from 'express'
import { context } from '../../services/context'
import logger from '../../../logger'
import NomisMigrationService from '../../services/nomisMigrationService'
import trimForm from '../../utils/trim'
import AdvancesNomisMigrationService from '../../services/advances/advancesNomisMigrationService'
import { alreadyMigratedLogAnalyticsLink, messageLogAnalyticsLink } from '../../utils/logAnalyticsUrlBuilder'
import AdvancesNomisPrisonerService from '../../services/advances/advancesNomisPrisonerService'

export default class AdvancesMigrationController {
  constructor(
    private readonly advancesNomisMigrationService: AdvancesNomisMigrationService,
    private readonly advancesNomisPrisonerService: AdvancesNomisPrisonerService,
    private readonly nomisMigrationService: NomisMigrationService,
  ) {}

  private migrationType = 'ADVANCES'

  async getMigrations(_: Request, res: Response): Promise<void> {
    const { migrations } = await this.nomisMigrationService.getMigrationHistory(this.migrationType, context(res))
    const decoratedMigrations = migrations.map(history => ({
      ...history,
      applicationInsightsLink: alreadyMigratedLogAnalyticsLink(
        'Will not migrate the prisoner advances',
        history.whenStarted,
        history.whenEnded,
      ),
    }))
    res.render('pages/advances/advancesMigration', { migrations: decoratedMigrations })
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
    res.render('pages/advances/advancesMigrationFailures', { failures: failuresDecorated })
  }

  async startNewMigration(req: Request, res: Response): Promise<void> {
    delete req.session.noFilterMigrationForm
    await this.startMigration(req, res)
  }

  async startMigration(req: Request, res: Response): Promise<void> {
    res.render('pages/advances/startAdvancesMigration', {
      form: req.session.noFilterMigrationForm,
      errors: req.flash('errors'),
    })
  }

  async postStartMigration(req: Request, res: Response): Promise<void> {
    req.session.noFilterMigrationForm = { ...trimForm(req.body) }
    req.session.noFilterMigrationForm = req.session.noFilterMigrationForm || {}

    const count = await this.advancesNomisPrisonerService.getMigrationEstimatedCount(context(res))
    const dlqCountString = await this.nomisMigrationService.getFailureCount(this.migrationType, context(res))
    logger.info(`${dlqCountString} advances failures found`)

    req.session.noFilterMigrationForm.estimatedCount = count.toLocaleString()
    req.session.noFilterMigrationForm.dlqCount = dlqCountString.toLocaleString()
    res.redirect('/advances-migration/start/preview')
  }

  async startMigrationPreview(req: Request, res: Response): Promise<void> {
    res.render('pages/advances/startAdvancesMigrationPreview', { form: req.session.noFilterMigrationForm })
  }

  async postClearDLQMigrationPreview(req: Request, res: Response): Promise<void> {
    const result = await this.nomisMigrationService.deleteFailures(this.migrationType, context(res))
    logger.info(`${result.messagesFoundCount} advances failures deleted`)
    req.body = { ...req.session.noFilterMigrationForm }
    await this.postStartMigration(req, res)
  }

  async postStartMigrationPreview(req: Request, res: Response): Promise<void> {
    req.session.noFilterMigrationForm = req.session.noFilterMigrationForm || {}
    const result = await this.advancesNomisMigrationService.startMigration(context(res))
    req.session.noFilterMigrationForm.estimatedCount = result.estimatedCount.toLocaleString()
    req.session.noFilterMigrationForm.migrationId = result.migrationId
    res.redirect('/advances-migration/start/confirmation')
  }

  async startMigrationConfirmation(req: Request, res: Response): Promise<void> {
    res.render('pages/advances/startAdvancesMigrationConfirmation', { form: req.session.noFilterMigrationForm })
  }

  async migrationDetails(req: Request, res: Response): Promise<void> {
    const { migrationId } = req.query as { migrationId: string }
    const migration = await this.nomisMigrationService.getMigration(migrationId, context(res))
    res.render('pages/advances/advancesMigrationDetails', { migration: { ...migration, history: migration.history } })
  }

  async cancelMigration(req: Request, res: Response): Promise<void> {
    const { migrationId }: { migrationId: string } = req.body
    await this.nomisMigrationService.cancelMigration(migrationId, context(res))
    const migration = await this.nomisMigrationService.getMigration(migrationId, context(res))
    res.render('pages/advances/advancesMigrationDetails', { migration: { ...migration, history: migration.history } })
  }
}
