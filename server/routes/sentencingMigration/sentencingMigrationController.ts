import { Request, Response } from 'express'
import { StartSentencingMigrationForm } from 'express-session'
import moment from 'moment'
import { context } from '../../services/context'
import NomisMigrationService from '../../services/nomisMigrationService'
import { MigrationHistory, SentencingMigrationFilter } from '../../@types/migration'
import { buildUrl } from '../../utils/applicationInsightsUrlBuilder'
import trimForm from '../../utils/trim'
import logger from '../../../logger'
import startSentencingMigrationValidator from './startSentencingMigrationValidator'
import NomisPrisonerService from '../../services/nomisPrisonerService'
import SentencingNomisMigrationService from '../../services/sentencing/sentencingNomisMigrationService'

interface Filter {
  fromDate?: string
  toDate?: string
}

export default class SentencingMigrationController {
  constructor(
    private readonly sentencingNomisMigrationService: SentencingNomisMigrationService,
    private readonly nomisMigrationService: NomisMigrationService,
    private readonly nomisPrisonerService: NomisPrisonerService,
  ) {}

  private migrationType: string = 'SENTENCING_ADJUSTMENTS'

  async getSentencingMigrations(_: Request, res: Response): Promise<void> {
    const { migrations } = await this.nomisMigrationService.getMigrationHistory(this.migrationType, context(res))

    const decoratedMigrations = migrations.map(history => ({
      ...history,
      applicationInsightsLink: SentencingMigrationController.applicationInsightsUrl(
        SentencingMigrationController.alreadyMigratedApplicationInsightsQuery(history.whenStarted, history.whenEnded),
      ),
    }))
    res.render('pages/sentencing/sentencingMigration', {
      migrations: decoratedMigrations,
    })
  }

  async viewFailures(_: Request, res: Response): Promise<void> {
    const failures = await this.nomisMigrationService.getFailures(this.migrationType, context(res))
    const failuresDecorated = {
      ...failures,
      messages: failures.messages.map(message => ({
        ...message,
        applicationInsightsLink: SentencingMigrationController.applicationInsightsUrl(
          SentencingMigrationController.messageApplicationInsightsQuery(message),
        ),
      })),
    }
    res.render('pages/sentencing/sentencingMigrationFailures', { failures: failuresDecorated })
  }

  async startNewSentencingMigration(req: Request, res: Response): Promise<void> {
    delete req.session.startSentencingMigrationForm
    await this.startSentencingMigration(req, res)
  }

  async startSentencingMigration(req: Request, res: Response): Promise<void> {
    res.render('pages/sentencing/startSentencingMigration', {
      form: req.session.startSentencingMigrationForm,
      errors: req.flash('errors'),
    })
  }

  async postStartSentencingMigration(req: Request, res: Response): Promise<void> {
    req.session.startSentencingMigrationForm = { ...trimForm(req.body) }

    const errors = startSentencingMigrationValidator(req.session.startSentencingMigrationForm)

    if (errors.length > 0) {
      req.flash('errors', errors)
      res.redirect('/sentencing-migration/amend')
    } else {
      const filter = SentencingMigrationController.toFilter(req.session.startSentencingMigrationForm)
      const count = await this.nomisPrisonerService.getSentencingMigrationEstimatedCount(filter, context(res))
      const dlqCountString = await this.nomisMigrationService.getFailureCount(this.migrationType, context(res))
      logger.info(`${dlqCountString} failures found`)

      req.session.startSentencingMigrationForm.estimatedCount = count.toLocaleString()
      req.session.startSentencingMigrationForm.dlqCount = dlqCountString.toLocaleString()
      res.redirect('/sentencing-migration/start/preview')
    }
  }

  async startSentencingMigrationPreview(req: Request, res: Response): Promise<void> {
    res.render('pages/sentencing/startSentencingMigrationPreview', { form: req.session.startSentencingMigrationForm })
  }

  async postClearDLQSentencingMigrationPreview(req: Request, res: Response): Promise<void> {
    const result = await this.nomisMigrationService.deleteFailures(this.migrationType, context(res))
    logger.info(`${result.messagesFoundCount} failures deleted`)
    req.body = { ...req.session.startSentencingMigrationForm }
    await this.postStartSentencingMigration(req, res)
  }

  async postStartSentencingMigrationPreview(req: Request, res: Response): Promise<void> {
    const filter = SentencingMigrationController.toFilter(req.session.startSentencingMigrationForm)

    const result = await this.sentencingNomisMigrationService.startSentencingMigration(filter, context(res))
    req.session.startSentencingMigrationForm.estimatedCount = result.estimatedCount.toLocaleString()
    req.session.startSentencingMigrationForm.migrationId = result.migrationId
    res.redirect('/sentencing-migration/start/confirmation')
  }

  async startSentencingMigrationConfirmation(req: Request, res: Response): Promise<void> {
    res.render('pages/sentencing/startSentencingMigrationConfirmation', {
      form: req.session.startSentencingMigrationForm,
    })
  }

  async sentencingMigrationDetails(req: Request, res: Response): Promise<void> {
    const { migrationId } = req.query as { migrationId: string }
    const migration = await this.nomisMigrationService.getMigration(migrationId, context(res))
    res.render('pages/sentencing/sentencingMigrationDetails', {
      migration: { ...migration, history: SentencingMigrationController.withFilter(migration.history) },
    })
  }

  async cancelMigration(req: Request, res: Response): Promise<void> {
    const { migrationId }: { migrationId: string } = req.body
    await this.nomisMigrationService.cancelMigration(migrationId, context(res))
    const migration = await this.nomisMigrationService.getMigration(migrationId, context(res))
    res.render('pages/sentencing/sentencingMigrationDetails', {
      migration: { ...migration, history: SentencingMigrationController.withFilter(migration.history) },
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
    | where message contains 'Will not migrate the adjustment since it is migrated already,'
    | where timestamp between (datetime(${SentencingMigrationController.toISODateTime(
      startedDate,
    )}) .. datetime(${SentencingMigrationController.toISODateTime(endedDate)}))
    | summarize dcount(message)`
  }

  private static toISODateTime(localDateTime: string): string {
    return moment(localDateTime).toISOString()
  }

  private static applicationInsightsUrl(query: string): string {
    return buildUrl(query, 'P1D')
  }

  private static withFilter(migration: MigrationHistory): MigrationHistory & {
    filterToDate?: string
    filterFromDate?: string
  } {
    const filter: Filter = JSON.parse(migration.filter)
    const filterToDate = filter.toDate
    const filterFromDate = filter.fromDate
    return {
      ...migration,
      ...(filterToDate && { filterToDate }),
      ...(filterFromDate && { filterFromDate }),
    }
  }

  private static toFilter(form: StartSentencingMigrationForm): SentencingMigrationFilter {
    return {
      fromDate: form.fromDate,
      toDate: form.toDate,
    }
  }
}
