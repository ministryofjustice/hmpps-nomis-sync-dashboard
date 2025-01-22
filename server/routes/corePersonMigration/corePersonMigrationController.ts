import { Request, Response } from 'express'
import moment from 'moment'
import { buildUrl } from '../../utils/applicationInsightsUrlBuilder'
import trimForm from '../../utils/trim'
import logger from '../../../logger'
import CorePersonNomisMigrationService from '../../services/coreperson/corePersonNomisMigrationService'
import NomisPrisonerService from '../../services/nomisPrisonerService'
import { Context } from '../../services/nomisMigrationService'

function context(res: Response): Context {
  return {
    username: res?.locals?.user?.username,
    token: res?.locals?.user?.token,
  }
}

export default class CorePersonMigrationController {
  constructor(
    private readonly nomisMigrationService: CorePersonNomisMigrationService,
    private readonly nomisPrisonerService: NomisPrisonerService,
  ) {}

  async getMigrations(req: Request, res: Response): Promise<void> {
    const { migrations } = await this.nomisMigrationService.getMigrations(context(res))

    const decoratedMigrations = migrations.map(history => ({
      ...history,
      applicationInsightsLink: CorePersonMigrationController.applicationInsightsUrl(
        CorePersonMigrationController.alreadyMigratedApplicationInsightsQuery(history.whenStarted, history.whenEnded),
      ),
    }))
    res.render('pages/coreperson/corePersonMigration', {
      migrations: decoratedMigrations,
    })
  }

  async viewFailures(req: Request, res: Response): Promise<void> {
    const failures = await this.nomisMigrationService.getFailures(context(res))
    const failuresDecorated = {
      ...failures,
      messages: failures.messages.map(message => ({
        ...message,
        applicationInsightsLink: CorePersonMigrationController.applicationInsightsUrl(
          CorePersonMigrationController.messageApplicationInsightsQuery(message),
        ),
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
      errors: req.flash('errors'),
    })
  }

  async postStartMigration(req: Request, res: Response): Promise<void> {
    req.session.startCorePersonMigrationForm = { ...trimForm(req.body) }

    const count = await this.nomisPrisonerService.getCorePersonMigrationEstimatedCount(context(res))
    const dlqCountString = await this.nomisMigrationService.getDLQMessageCount(context(res))
    logger.info(`${dlqCountString} failures found`)

    req.session.startCorePersonMigrationForm.estimatedCount = count.toLocaleString()
    req.session.startCorePersonMigrationForm.dlqCount = dlqCountString.toLocaleString()
    res.redirect('/coreperson-migration/start/preview')
  }

  async startMigrationPreview(req: Request, res: Response): Promise<void> {
    res.render('pages/coreperson/startCorePersonMigrationPreview', {
      form: req.session.startCorePersonMigrationForm,
    })
  }

  async postClearDLQMigrationPreview(req: Request, res: Response): Promise<void> {
    const result = await this.nomisMigrationService.deleteFailures(context(res))
    logger.info(`${result.messagesFoundCount} failures deleted`)
    req.body = { ...req.session.startCorePersonMigrationForm }
    await this.postStartMigration(req, res)
  }

  async postStartMigrationPreview(req: Request, res: Response): Promise<void> {
    const result = await this.nomisMigrationService.startMigration(context(res))
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

  private static messageApplicationInsightsQuery(message: { messageId: string }): string {
    return `exceptions
    | where cloud_RoleName == 'hmpps-prisoner-from-nomis-migration' 
    | where customDimensions.["Logger Message"] == "MessageID:${message.messageId}"
    | order by timestamp desc`
  }

  private static alreadyMigratedApplicationInsightsQuery(startedDate: string, endedDate: string): string {
    return `traces
    | where cloud_RoleName == 'hmpps-prisoner-from-nomis-migration' 
    | where message contains 'Will not migrate the nomis person'
    | where timestamp between (datetime(${CorePersonMigrationController.toISODateTime(
      startedDate,
    )}) .. datetime(${CorePersonMigrationController.toISODateTime(endedDate)}))
    | summarize dcount(message)`
  }

  private static toISODateTime(localDateTime: string): string {
    return moment(localDateTime).toISOString()
  }

  private static applicationInsightsUrl(query: string): string {
    return buildUrl(query, 'P1D')
  }
}
