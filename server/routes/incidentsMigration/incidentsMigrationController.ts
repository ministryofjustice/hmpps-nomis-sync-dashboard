import { Request, Response } from 'express'
import { StartIncidentsMigrationForm } from 'express-session'
import { context } from '../../services/context'
import NomisMigrationService from '../../services/nomisMigrationService'
import { MigrationHistory, IncidentsMigrationFilter } from '../../@types/migration'
import trimForm from '../../utils/trim'
import logger from '../../../logger'
import startIncidentsMigrationValidator from './startIncidentsMigrationValidator'
import NomisPrisonerService from '../../services/nomisPrisonerService'
import IncidentsNomisMigrationService from '../../services/incidents/incidentsNomisMigrationService'
import { alreadyMigratedLogAnalyticsLink, messageLogAnalyticsLink } from '../../utils/logAnalyticsUrlBuilder'

interface Filter {
  fromDate?: string
  toDate?: string
}

export default class IncidentsMigrationController {
  constructor(
    private readonly incidentsNomisMigrationService: IncidentsNomisMigrationService,
    private readonly nomisMigrationService: NomisMigrationService,
    private readonly nomisPrisonerService: NomisPrisonerService,
  ) {}

  private migrationType: string = 'INCIDENTS'

  async getIncidentsMigrations(_: Request, res: Response): Promise<void> {
    const { migrations } = await this.nomisMigrationService.getMigrationHistory(this.migrationType, context(res))

    const decoratedMigrations = migrations.map(history => ({
      ...history,
      applicationInsightsLink: alreadyMigratedLogAnalyticsLink(
        'Will not migrate the nomis incident',
        history.whenStarted,
        history.whenEnded,
      ),
    }))
    res.render('pages/incidents/incidentsMigration', {
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
    res.render('pages/incidents/incidentsMigrationFailures', { failures: failuresDecorated })
  }

  async startNewIncidentsMigration(req: Request, res: Response): Promise<void> {
    delete req.session.startIncidentsMigrationForm
    await this.startIncidentsMigration(req, res)
  }

  async startIncidentsMigration(req: Request, res: Response): Promise<void> {
    res.render('pages/incidents/startIncidentsMigration', {
      form: req.session.startIncidentsMigrationForm,
      errors: req.flash('errors'),
    })
  }

  async postStartIncidentsMigration(req: Request, res: Response): Promise<void> {
    req.session.startIncidentsMigrationForm = { ...trimForm(req.body) }

    const errors = startIncidentsMigrationValidator(req.session.startIncidentsMigrationForm)

    if (errors.length > 0) {
      req.flash('errors', errors)
      res.redirect('/incidents-migration/amend')
    } else {
      const filter = IncidentsMigrationController.toFilter(req.session.startIncidentsMigrationForm)
      const count = await this.nomisPrisonerService.getIncidentsMigrationEstimatedCount(filter, context(res))
      const dlqCountString = await this.nomisMigrationService.getFailureCount(this.migrationType, context(res))
      logger.info(`${dlqCountString} failures found`)

      req.session.startIncidentsMigrationForm.estimatedCount = count.toLocaleString()
      req.session.startIncidentsMigrationForm.dlqCount = dlqCountString.toLocaleString()
      res.redirect('/incidents-migration/start/preview')
    }
  }

  async startIncidentsMigrationPreview(req: Request, res: Response): Promise<void> {
    res.render('pages/incidents/startIncidentsMigrationPreview', { form: req.session.startIncidentsMigrationForm })
  }

  async postClearDLQIncidentsMigrationPreview(req: Request, res: Response): Promise<void> {
    const result = await this.nomisMigrationService.deleteFailures(this.migrationType, context(res))
    logger.info(`${result.messagesFoundCount} failures deleted`)
    req.body = { ...req.session.startIncidentsMigrationForm }
    await this.postStartIncidentsMigration(req, res)
  }

  async postStartIncidentsMigrationPreview(req: Request, res: Response): Promise<void> {
    const filter = IncidentsMigrationController.toFilter(req.session.startIncidentsMigrationForm)

    const result = await this.incidentsNomisMigrationService.startIncidentsMigration(filter, context(res))
    req.session.startIncidentsMigrationForm.estimatedCount = result.estimatedCount.toLocaleString()
    req.session.startIncidentsMigrationForm.migrationId = result.migrationId
    res.redirect('/incidents-migration/start/confirmation')
  }

  async startIncidentsMigrationConfirmation(req: Request, res: Response): Promise<void> {
    res.render('pages/incidents/startIncidentsMigrationConfirmation', {
      form: req.session.startIncidentsMigrationForm,
    })
  }

  async incidentsMigrationDetails(req: Request, res: Response): Promise<void> {
    const { migrationId } = req.query as { migrationId: string }
    const migration = await this.nomisMigrationService.getMigration(migrationId, context(res))
    res.render('pages/incidents/incidentsMigrationDetails', {
      migration: { ...migration, history: IncidentsMigrationController.withFilter(migration.history) },
    })
  }

  async cancelMigration(req: Request, res: Response): Promise<void> {
    const { migrationId }: { migrationId: string } = req.body
    await this.nomisMigrationService.cancelMigration(migrationId, context(res))
    const migration = await this.nomisMigrationService.getMigration(migrationId, context(res))
    res.render('pages/incidents/incidentsMigrationDetails', {
      migration: { ...migration, history: IncidentsMigrationController.withFilter(migration.history) },
    })
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

  private static toFilter(form: StartIncidentsMigrationForm): IncidentsMigrationFilter {
    return {
      fromDate: form.fromDate,
      toDate: form.toDate,
    }
  }
}
