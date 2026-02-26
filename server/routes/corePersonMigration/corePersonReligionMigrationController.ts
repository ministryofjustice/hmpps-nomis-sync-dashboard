import { Request, Response } from 'express'
import trimForm from '../../utils/trim'
import logger from '../../../logger'
import CorePersonNomisMigrationService from '../../services/coreperson/corePersonNomisMigrationService'
import NomisPrisonerService from '../../services/nomisPrisonerService'
import { context } from '../../services/context'
import NomisMigrationService from '../../services/nomisMigrationService'
import { alreadyMigratedLogAnalyticsLink, messageLogAnalyticsLink } from '../../utils/logAnalyticsUrlBuilder'

export default class CorePersonReligionMigrationController {
  constructor(
    private readonly corePersonMigrationService: CorePersonNomisMigrationService,
    private readonly nomisPrisonerService: NomisPrisonerService,
    private readonly nomisMigrationService: NomisMigrationService,
  ) {}

  private migrationType: string = 'CORE_PERSON_RELIGION'

  async getMigrations(_: Request, res: Response): Promise<void> {
    const { migrations } = await this.nomisMigrationService.getMigrationHistory(this.migrationType, context(res))

    const decoratedMigrations = migrations.map(history => ({
      ...history,
      applicationInsightsLink: alreadyMigratedLogAnalyticsLink(
        'Will not migrate the nomis core person religion',
        history.whenStarted,
        history.whenEnded,
      ),
    }))
    res.render('pages/coreperson/corePersonReligionMigration', {
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
    res.render('pages/coreperson/corePersonReligionMigrationFailures', { failures: failuresDecorated })
  }

  async startNewMigration(req: Request, res: Response): Promise<void> {
    delete req.session.startCorePersonMigrationForm
    await this.startMigration(req, res)
  }

  async startMigration(req: Request, res: Response): Promise<void> {
    res.render('pages/coreperson/startCorePersonReligionMigration', {
      form: req.session.startCorePersonMigrationForm,
      errors: req.flash('errors'),
    })
  }

  async postStartMigration(req: Request, res: Response): Promise<void> {
    req.session.startCorePersonMigrationForm = { ...trimForm(req.body) }

    const count = await this.nomisPrisonerService.getCorePersonMigrationEstimatedCount(context(res))
    const dlqCountString = await this.nomisMigrationService.getFailureCount(this.migrationType, context(res))
    logger.info(`${dlqCountString} failures found`)

    req.session.startCorePersonMigrationForm.estimatedCount = count.toLocaleString()
    req.session.startCorePersonMigrationForm.dlqCount = dlqCountString.toLocaleString()
    res.redirect('/coreperson-religion-migration/start/preview')
  }

  async startMigrationPreview(req: Request, res: Response): Promise<void> {
    res.render('pages/coreperson/startCorePersonReligionMigrationPreview', {
      form: req.session.startCorePersonMigrationForm,
    })
  }

  async postClearDLQMigrationPreview(req: Request, res: Response): Promise<void> {
    const result = await this.nomisMigrationService.deleteFailures(this.migrationType, context(res))
    logger.info(`${result.messagesFoundCount} failures deleted`)
    req.body = { ...req.session.startCorePersonMigrationForm }
    await this.postStartMigration(req, res)
  }

  async postStartMigrationPreview(req: Request, res: Response): Promise<void> {
    const result = await this.corePersonMigrationService.startMigration(context(res))
    req.session.startCorePersonMigrationForm.estimatedCount = result.estimatedCount.toLocaleString()
    req.session.startCorePersonMigrationForm.migrationId = result.migrationId
    res.redirect('/coreperson-religion-migration/start/confirmation')
  }

  async startMigrationConfirmation(req: Request, res: Response): Promise<void> {
    res.render('pages/coreperson/startCorePersonReligionMigrationConfirmation', {
      form: req.session.startCorePersonMigrationForm,
    })
  }

  async migrationDetails(req: Request, res: Response): Promise<void> {
    const { migrationId } = req.query as { migrationId: string }
    const migration = await this.nomisMigrationService.getMigration(migrationId, context(res))
    res.render('pages/coreperson/corePersonReligionMigrationDetails', {
      migration: { ...migration, history: migration.history },
    })
  }

  async cancelMigration(req: Request, res: Response): Promise<void> {
    const { migrationId }: { migrationId: string } = req.body
    await this.nomisMigrationService.cancelMigration(migrationId, context(res))
    const migration = await this.nomisMigrationService.getMigration(migrationId, context(res))
    res.render('pages/coreperson/corePersonReligionMigrationDetails', {
      migration: { ...migration, history: migration.history },
    })
  }
}
