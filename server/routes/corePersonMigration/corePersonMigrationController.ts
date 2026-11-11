import { Request, Response } from 'express'
import trimForm from '../../utils/trim'
import logger from '../../../logger'
import CorePersonNomisMigrationService from '../../services/coreperson/corePersonNomisMigrationService'
import NomisPrisonerService from '../../services/nomisPrisonerService'
import { context } from '../../services/context'
import NomisMigrationService from '../../services/nomisMigrationService'
import { alreadyMigratedLogAnalyticsLink, messageLogAnalyticsLink } from '../../utils/logAnalyticsUrlBuilder'

export default class CorePersonMigrationController {
  constructor(
    private readonly corePersonMigrationService: CorePersonNomisMigrationService,
    private readonly nomisPrisonerService: NomisPrisonerService,
    private readonly nomisMigrationService: NomisMigrationService,
  ) {}

  // all core person migration types share the same queue, so any type can be used for failures
  private migrationType: string = 'CORE_PERSON_ADDRESS_CONTACT'

  private migrationTypes = [
    { value: 'CORE_PERSON_ADDRESS_CONTACT', text: 'Addresses and contacts' },
    { value: 'CORE_PERSON_ALIAS_IDENTIFIER', text: 'Aliases and identifiers' },
  ]

  async getMigrations(_: Request, res: Response): Promise<void> {
    const histories = await Promise.all(
      this.migrationTypes.map(({ value }) => this.nomisMigrationService.getMigrationHistory(value, context(res))),
    )

    const decoratedMigrations = histories
      .flatMap(({ migrations }) => migrations)
      .sort((a, b) => b.whenStarted.localeCompare(a.whenStarted))
      .map(history => ({
        ...history,
        migrationTypeName: this.migrationTypeName(history.migrationType),
        applicationInsightsLink: alreadyMigratedLogAnalyticsLink(
          'Will not migrate the prisoner',
          history.whenStarted,
          history.whenEnded,
        ),
      }))
    res.render('pages/coreperson/corePersonMigration', {
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
    res.render('pages/coreperson/corePersonMigrationFailures', { failures: failuresDecorated })
  }

  async startNewMigration(req: Request, res: Response): Promise<void> {
    delete req.session.startCorePersonMigrationForm
    await this.startMigration(req, res)
  }

  async startMigration(req: Request, res: Response): Promise<void> {
    res.render('pages/coreperson/startCorePersonMigration', {
      form: req.session.startCorePersonMigrationForm,
      migrationTypes: this.migrationTypes,
      errors: req.flash('errors'),
    })
  }

  async postStartMigration(req: Request, res: Response): Promise<void> {
    req.session.startCorePersonMigrationForm = { ...trimForm(req.body) }
    const { migrationType } = req.session.startCorePersonMigrationForm
    if (!this.migrationTypes.some(({ value }) => value === migrationType)) {
      req.flash('errors', [{ href: '#migrationType', text: 'Select the type of core person migration' }])
      return res.redirect('/coreperson-migration/amend')
    }
    req.session.startCorePersonMigrationForm.migrationTypeName = this.migrationTypeName(migrationType)

    const count = await this.nomisPrisonerService.getCorePersonMigrationEstimatedCount(context(res))
    const dlqCountString = await this.nomisMigrationService.getFailureCount(this.migrationType, context(res))
    logger.info(`${dlqCountString} failures found`)

    req.session.startCorePersonMigrationForm.estimatedCount = count.toLocaleString()
    req.session.startCorePersonMigrationForm.dlqCount = dlqCountString.toLocaleString()
    return res.redirect('/coreperson-migration/start/preview')
  }

  async startMigrationPreview(req: Request, res: Response): Promise<void> {
    res.render('pages/coreperson/startCorePersonMigrationPreview', {
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
    const result = await this.corePersonMigrationService.startMigration(
      req.session.startCorePersonMigrationForm.migrationType,
      context(res),
    )
    req.session.startCorePersonMigrationForm.estimatedCount = result.estimatedCount.toLocaleString()
    req.session.startCorePersonMigrationForm.migrationId = result.migrationId
    res.redirect('/coreperson-migration/start/confirmation')
  }

  async startMigrationConfirmation(req: Request, res: Response): Promise<void> {
    res.render('pages/coreperson/startCorePersonMigrationConfirmation', {
      form: req.session.startCorePersonMigrationForm,
    })
  }

  async migrationDetails(req: Request, res: Response): Promise<void> {
    const { migrationId } = req.query as { migrationId: string }
    const migration = await this.nomisMigrationService.getMigration(migrationId, context(res))
    res.render('pages/coreperson/corePersonMigrationDetails', {
      migration: { ...migration, history: migration.history },
    })
  }

  async cancelMigration(req: Request, res: Response): Promise<void> {
    const { migrationId }: { migrationId: string } = req.body
    await this.nomisMigrationService.cancelMigration(migrationId, context(res))
    const migration = await this.nomisMigrationService.getMigration(migrationId, context(res))
    res.render('pages/coreperson/corePersonMigrationDetails', {
      migration: { ...migration, history: migration.history },
    })
  }

  private migrationTypeName(migrationType: string): string {
    return this.migrationTypes.find(({ value }) => value === migrationType)?.text ?? migrationType
  }
}
