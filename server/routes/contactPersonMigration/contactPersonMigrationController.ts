import { Request, Response } from 'express'
import trimForm from '../../utils/trim'
import logger from '../../../logger'
import startMigrationValidator from './contactPersonMigrationValidator'
import ContactPersonNomisMigrationService from '../../services/contactperson/contactPersonNomisMigrationService'
import ContactPersonNomisPrisonerService from '../../services/contactperson/contactPersonNomisPrisonerService'
import { context } from '../../services/context'
import NomisMigrationService from '../../services/nomisMigrationService'
import { alreadyMigratedLogAnalyticsLink, messageLogAnalyticsLink } from '../../utils/logAnalyticsUrlBuilder'

export default class ContactPersonMigrationController {
  constructor(
    private readonly contactPersonNomisMigrationService: ContactPersonNomisMigrationService,
    private readonly nomisPrisonerService: ContactPersonNomisPrisonerService,
    private readonly nomisMigrationService: NomisMigrationService,
  ) {}

  private migrationType: string = 'PERSONALRELATIONSHIPS'

  async getMigrations(_: Request, res: Response): Promise<void> {
    const { migrations } = await this.nomisMigrationService.getMigrationHistory(this.migrationType, context(res))

    const decoratedMigrations = migrations.map(history => ({
      ...history,
      applicationInsightsLink: alreadyMigratedLogAnalyticsLink(
        'Will not migrate the nomis prisoner restriction',
        history.whenStarted,
        history.whenEnded,
      ),
    }))
    res.render('pages/contactperson/contactPersonMigration', {
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
    res.render('pages/contactperson/contactPersonMigrationFailures', { failures: failuresDecorated })
  }

  async startNewMigration(req: Request, res: Response): Promise<void> {
    delete req.session.startDateFilteredMigrationForm
    await this.startMigration(req, res)
  }

  async startMigration(req: Request, res: Response): Promise<void> {
    res.render('pages/contactperson/startContactPersonMigration', {
      form: req.session.startDateFilteredMigrationForm,
      errors: req.flash('errors'),
    })
  }

  async postStartMigration(req: Request, res: Response): Promise<void> {
    req.session.startDateFilteredMigrationForm = { ...trimForm(req.body) }

    const errors = startMigrationValidator(req.session.startDateFilteredMigrationForm)

    if (errors.length > 0) {
      req.flash('errors', errors)
      res.redirect('/contactperson-migration/amend')
    } else {
      const filter = req.session.startDateFilteredMigrationForm
      const count = await this.nomisPrisonerService.getMigrationEstimatedCount(filter, context(res))
      const dlqCountString = await this.nomisMigrationService.getFailureCount(this.migrationType, context(res))
      logger.info(`${dlqCountString} failures found`)

      req.session.startDateFilteredMigrationForm.estimatedCount = count.toLocaleString()
      req.session.startDateFilteredMigrationForm.dlqCount = dlqCountString.toLocaleString()
      res.redirect('/contactperson-migration/start/preview')
    }
  }

  async startMigrationPreview(req: Request, res: Response): Promise<void> {
    res.render('pages/contactperson/startContactPersonMigrationPreview', {
      form: req.session.startDateFilteredMigrationForm,
    })
  }

  async postClearDLQMigrationPreview(req: Request, res: Response): Promise<void> {
    const result = await this.nomisMigrationService.deleteFailures(this.migrationType, context(res))
    logger.info(`${result.messagesFoundCount} failures deleted`)
    req.body = { ...req.session.startDateFilteredMigrationForm }
    await this.postStartMigration(req, res)
  }

  async postStartMigrationPreview(req: Request, res: Response): Promise<void> {
    const filter = req.session.startDateFilteredMigrationForm
    const result = await this.contactPersonNomisMigrationService.startMigration(filter, context(res))
    req.session.startDateFilteredMigrationForm.estimatedCount = result.estimatedCount.toLocaleString()
    req.session.startDateFilteredMigrationForm.migrationId = result.migrationId
    res.redirect('/contactperson-migration/start/confirmation')
  }

  async startMigrationConfirmation(req: Request, res: Response): Promise<void> {
    res.render('pages/contactperson/startContactPersonMigrationConfirmation', {
      form: req.session.startDateFilteredMigrationForm,
    })
  }

  async migrationDetails(req: Request, res: Response): Promise<void> {
    const { migrationId } = req.query as { migrationId: string }
    const migration = await this.nomisMigrationService.getMigration(migrationId, context(res))
    res.render('pages/contactperson/contactPersonMigrationDetails', {
      migration: { ...migration, history: migration.history },
    })
  }

  async cancelMigration(req: Request, res: Response): Promise<void> {
    const { migrationId }: { migrationId: string } = req.body
    await this.nomisMigrationService.cancelMigration(migrationId, context(res))
    const migration = await this.nomisMigrationService.getMigration(migrationId, context(res))
    res.render('pages/contactperson/contactPersonMigrationDetails', {
      migration: { ...migration, history: migration.history },
    })
  }
}
