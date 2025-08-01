import { Request, Response } from 'express'
import { StartCourtSentencingMigrationForm } from 'express-session'
import { context } from '../../services/context'
import NomisMigrationService from '../../services/nomisMigrationService'
import { MigrationHistory, CourtSentencingMigrationFilter } from '../../@types/migration'
import trimForm from '../../utils/trim'
import logger from '../../../logger'
import startCourtSentencingMigrationValidator from './startCourtSentencingMigrationValidator'
import NomisPrisonerService from '../../services/nomisPrisonerService'
import CourtSentencingNomisMigrationService from '../../services/courtSentencing/courtSentencingNomisMigrationService'
import { alreadyMigratedLogAnalyticsLink, messageLogAnalyticsLink } from '../../utils/logAnalyticsUrlBuilder'

interface Filter {
  prisonIds?: string[]
  fromDate?: string
  toDate?: string
}

export default class CourtSentencingMigrationController {
  constructor(
    private readonly courtSentencingNomisMigrationService: CourtSentencingNomisMigrationService,
    private readonly nomisMigrationService: NomisMigrationService,
    private readonly nomisPrisonerService: NomisPrisonerService,
  ) {}

  private migrationType: string = 'COURT_SENTENCING'

  async getCourtSentencingMigrations(_: Request, res: Response): Promise<void> {
    const { migrations } = await this.nomisMigrationService.getMigrationHistory(this.migrationType, context(res))

    const decoratedMigrations = migrations.map(CourtSentencingMigrationController.withFilter).map(history => ({
      ...history,
      applicationInsightsLink: alreadyMigratedLogAnalyticsLink(
        'Will not migrate the alert since it is migrated',
        history.whenStarted,
        history.whenEnded,
      ),
    }))
    res.render('pages/courtSentencing/courtSentencingMigration', {
      migrations: decoratedMigrations,
      errors: [],
    })
  }

  async startNewCourtSentencingMigration(req: Request, res: Response): Promise<void> {
    delete req.session.startCourtSentencingMigrationForm
    await this.startCourtSentencingMigration(req, res)
  }

  async startCourtSentencingMigration(req: Request, res: Response): Promise<void> {
    res.render('pages/courtSentencing//startCourtSentencingMigration', {
      form: req.session.startCourtSentencingMigrationForm,
      errors: req.flash('errors'),
    })
  }

  async postStartCourtSentencingMigration(req: Request, res: Response): Promise<void> {
    req.session.startCourtSentencingMigrationForm = { ...trimForm(req.body) }

    const errors = startCourtSentencingMigrationValidator(req.session.startCourtSentencingMigrationForm)

    if (errors.length > 0) {
      req.flash('errors', errors)
      res.redirect('/court-sentencing-migration/amend')
    } else {
      const filter = CourtSentencingMigrationController.toFilter(req.session.startCourtSentencingMigrationForm)
      const count = await this.nomisPrisonerService.getCourtSentencingMigrationEstimatedCount(filter, context(res))
      const dlqCountString = await this.nomisMigrationService.getFailureCount(this.migrationType, context(res))
      logger.info(`${dlqCountString} failures found`)

      req.session.startCourtSentencingMigrationForm.estimatedCount = count.toLocaleString()
      req.session.startCourtSentencingMigrationForm.dlqCount = dlqCountString.toLocaleString()
      res.redirect('/court-sentencing-migration/start/preview')
    }
  }

  async startCourtSentencingMigrationPreview(req: Request, res: Response): Promise<void> {
    res.render('pages/courtSentencing/startCourtSentencingMigrationPreview', {
      form: req.session.startCourtSentencingMigrationForm,
    })
  }

  async postClearDLQCourtSentencingMigrationPreview(req: Request, res: Response): Promise<void> {
    const result = await this.nomisMigrationService.deleteFailures(this.migrationType, context(res))
    logger.info(`${result.messagesFoundCount} failures deleted`)
    req.body = { ...req.session.startCourtSentencingMigrationForm }
    await this.postStartCourtSentencingMigration(req, res)
  }

  async postStartCourtSentencingMigrationPreview(req: Request, res: Response): Promise<void> {
    const filter = CourtSentencingMigrationController.toFilter(req.session.startCourtSentencingMigrationForm)

    const result = await this.courtSentencingNomisMigrationService.startCourtSentencingMigration(filter, context(res))
    req.session.startCourtSentencingMigrationForm.estimatedCount = result.estimatedCount.toLocaleString()
    req.session.startCourtSentencingMigrationForm.migrationId = result.migrationId
    res.redirect('/court-sentencing-migration/start/confirmation')
  }

  async startCourtSentencingMigrationConfirmation(req: Request, res: Response): Promise<void> {
    res.render('pages/courtSentencing/startCourtSentencingMigrationConfirmation', {
      form: req.session.startCourtSentencingMigrationForm,
    })
  }

  async courtSentencingMigrationDetails(req: Request, res: Response): Promise<void> {
    const { migrationId } = req.query as { migrationId: string }
    const migration = await this.nomisMigrationService.getMigration(migrationId, context(res))
    res.render('pages/courtSentencing/courtSentencingMigrationDetails', {
      migration: { ...migration, history: CourtSentencingMigrationController.withFilter(migration.history) },
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
    res.render('pages/courtSentencing/courtSentencingMigrationFailures', { failures: failuresDecorated })
  }

  async cancelMigration(req: Request, res: Response): Promise<void> {
    const { migrationId }: { migrationId: string } = req.body
    await this.nomisMigrationService.cancelMigration(migrationId, context(res))
    const migration = await this.nomisMigrationService.getMigration(migrationId, context(res))
    res.render('pages/courtSentencing/courtSentencingMigrationDetails', {
      migration: { ...migration, history: CourtSentencingMigrationController.withFilter(migration.history) },
    })
  }

  private static toFilter(form: StartCourtSentencingMigrationForm): CourtSentencingMigrationFilter {
    return {
      fromDate: form.fromDate,
      toDate: form.toDate,
      deleteExisting: false,
    }
  }

  private static withFilter(migration: MigrationHistory): MigrationHistory & {
    filterPrisonIds?: string
    filterToDate?: string
    filterFromDate?: string
  } {
    const filter: Filter = JSON.parse(migration.filter)
    const filterPrisonIds = filter.prisonIds?.join()
    const filterToDate = filter.toDate
    const filterFromDate = filter.fromDate
    return {
      ...migration,
      ...(filterPrisonIds && { filterPrisonIds }),
      ...(filterToDate && { filterToDate }),
      ...(filterFromDate && { filterFromDate }),
    }
  }
}
