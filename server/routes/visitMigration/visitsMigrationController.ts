import { Request, Response } from 'express'
import { StartVisitsMigrationForm } from 'express-session'
import { context } from '../../services/context'
import NomisMigrationService from '../../services/nomisMigrationService'
import NomisPrisonerService from '../../services/nomisPrisonerService'
import trimForm from '../../utils/trim'
import startVisitsMigrationValidator from './startVisitsMigrationValidator'
import { MigrationHistory, VisitsMigrationFilter } from '../../@types/migration'
import { MigrationViewFilter } from '../../@types/dashboard'
import visitsMigrationValidator from './visitsMigrationValidator'
import logger from '../../../logger'
import { withDefaultTime } from '../../utils/utils'
import VisitsNomisMigrationService from '../../services/visits/visitsNomisMigrationService'
import { alreadyMigratedLogAnalyticsLink, messageLogAnalyticsLink } from '../../utils/logAnalyticsUrlBuilder'

interface Filter {
  prisonIds?: string[]
  visitTypes?: string[]
  fromDateTime?: string
  toDateTime?: string
}

export default class VisitsMigrationController {
  constructor(
    private readonly visitsNomisMigrationService: VisitsNomisMigrationService,
    private readonly nomisMigrationService: NomisMigrationService,
    private readonly nomisPrisonerService: NomisPrisonerService,
  ) {}

  private migrationType: string = 'VISITS'

  async getVisitMigrations(req: Request, res: Response): Promise<void> {
    const searchFilter = this.parseFilter(req)

    const errors = visitsMigrationValidator(searchFilter)

    if (errors.length > 0) {
      res.render('pages/visits/visitsMigration', {
        errors,
        migrationViewFilter: searchFilter,
      })
    } else {
      const { migrations } = await this.nomisMigrationService.getMigrationHistoryWithFilter(
        this.migrationType,
        context(res),
        {
          ...searchFilter,
          toDateTime: withDefaultTime(searchFilter.toDateTime),
          fromDateTime: withDefaultTime(searchFilter.fromDateTime),
        },
      )

      const decoratedMigrations = migrations.map(VisitsMigrationController.withFilter).map(history => ({
        ...history,
        applicationInsightsLink: alreadyMigratedLogAnalyticsLink(
          'Will not migrate visit since',
          history.whenStarted,
          history.whenEnded,
        ),
      }))
      res.render('pages/visits/visitsMigration', {
        migrations: decoratedMigrations,
        migrationViewFilter: searchFilter,
        errors: [],
      })
    }
  }

  async startNewVisitMigration(req: Request, res: Response): Promise<void> {
    delete req.session.startVisitsMigrationForm
    await this.startVisitMigration(req, res)
  }

  async startVisitMigration(req: Request, res: Response): Promise<void> {
    res.render('pages/visits/startVisitsMigration', {
      form: req.session.startVisitsMigrationForm,
      errors: req.flash('errors'),
    })
  }

  async postStartVisitMigration(req: Request, res: Response): Promise<void> {
    req.session.startVisitsMigrationForm = { ...trimForm(req.body) }

    const errors = startVisitsMigrationValidator(req.session.startVisitsMigrationForm)

    if (errors.length > 0) {
      req.flash('errors', errors)
      res.redirect('/visits-migration/amend')
    } else {
      const filter = VisitsMigrationController.toFilter(req.session.startVisitsMigrationForm)
      const count = await this.nomisPrisonerService.getVisitMigrationEstimatedCount(filter, context(res))
      const roomMappings = await this.visitsNomisMigrationService.getVisitMigrationRoomMappings(filter, context(res))
      const dlqCountString = await this.nomisMigrationService.getFailureCount(this.migrationType, context(res))
      logger.info(`${dlqCountString} failures found`)

      req.session.startVisitsMigrationForm.estimatedCount = count.toLocaleString()
      req.session.startVisitsMigrationForm.dlqCount = dlqCountString.toLocaleString()
      req.session.startVisitsMigrationForm.unmappedRooms = roomMappings
        .filter(r => !r.vsipRoom)
        .map(r => ({ room: r.agencyInternalLocationDescription, count: r.count }))
      res.redirect('/visits-migration/start/preview')
    }
  }

  async startVisitMigrationPreview(req: Request, res: Response): Promise<void> {
    res.render('pages/visits/startVisitsMigrationPreview', { form: req.session.startVisitsMigrationForm })
  }

  async postClearDLQVisitMigrationPreview(req: Request, res: Response): Promise<void> {
    const result = await this.nomisMigrationService.deleteFailures(this.migrationType, context(res))
    logger.info(`${result.messagesFoundCount} failures deleted`)
    req.body = { ...req.session.startVisitsMigrationForm }
    await this.postStartVisitMigration(req, res)
  }

  async postStartVisitMigrationPreview(req: Request, res: Response): Promise<void> {
    const filter = VisitsMigrationController.toFilter(req.session.startVisitsMigrationForm)

    const result = await this.visitsNomisMigrationService.startVisitsMigration(filter, context(res))
    req.session.startVisitsMigrationForm.estimatedCount = result.estimatedCount.toLocaleString()
    req.session.startVisitsMigrationForm.migrationId = result.migrationId
    res.redirect('/visits-migration/start/confirmation')
  }

  async startVisitMigrationConfirmation(req: Request, res: Response): Promise<void> {
    res.render('pages/visits/startVisitsMigrationConfirmation', { form: req.session.startVisitsMigrationForm })
  }

  async visitsMigrationDetails(req: Request, res: Response): Promise<void> {
    const { migrationId } = req.query as { migrationId: string }
    const migration = await this.nomisMigrationService.getMigration(migrationId, context(res))
    res.render('pages/visits/visitsMigrationDetails', {
      migration: { ...migration, history: VisitsMigrationController.withFilter(migration.history) },
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
    res.render('pages/visits/visitsMigrationFailures', { failures: failuresDecorated })
  }

  async cancelMigration(req: Request, res: Response): Promise<void> {
    const { migrationId }: { migrationId: string } = req.body
    await this.nomisMigrationService.cancelMigration(migrationId, context(res))
    const migration = await this.nomisMigrationService.getMigration(migrationId, context(res))
    res.render('pages/visits/visitsMigrationDetails', {
      migration: { ...migration, history: VisitsMigrationController.withFilter(migration.history) },
    })
  }

  private static toFilter(form: StartVisitsMigrationForm): VisitsMigrationFilter {
    return {
      prisonIds: VisitsMigrationController.asArray(form.prisonIds),
      visitTypes: VisitsMigrationController.asArray(form.visitTypes),
      fromDateTime: withDefaultTime(form.fromDateTime),
      toDateTime: withDefaultTime(form.toDateTime),
      ignoreMissingRoom: false,
    }
  }

  private static asArray(value: string | string[]): string[] {
    if (typeof value === 'string') {
      return value.split(',').map((v: string) => v.trim())
    }
    return value
  }

  parseFilter(req: Request): MigrationViewFilter {
    return {
      prisonId: req.query.prisonId as string | undefined,
      toDateTime: req.query.toDateTime as string | undefined,
      fromDateTime: req.query.fromDateTime as string | undefined,
      includeOnlyFailures: (req.query.includeOnlyFailures as string) === 'true',
    }
  }

  private static withFilter(migration: MigrationHistory): MigrationHistory & {
    filterPrisonIds?: string
    filterVisitTypes?: string
    filterToDate?: string
    filterFromDate?: string
  } {
    const filter: Filter = JSON.parse(migration.filter)
    const filterPrisonIds = filter.prisonIds?.join()
    const filterVisitTypes = filter.visitTypes?.join()
    const filterToDate = filter.toDateTime
    const filterFromDate = filter.fromDateTime
    return {
      ...migration,
      ...(filterPrisonIds && { filterPrisonIds }),
      ...(filterVisitTypes && { filterVisitTypes }),
      ...(filterToDate && { filterToDate }),
      ...(filterFromDate && { filterFromDate }),
    }
  }
}
