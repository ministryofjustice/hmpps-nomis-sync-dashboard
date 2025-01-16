import { Request, Response } from 'express'
import { StartAllocationsMigrationForm } from 'express-session'
import moment from 'moment'
import NomisMigrationService, { Context } from '../../services/nomisMigrationService'
import { MigrationHistory, AllocationsMigrationFilter } from '../../@types/migration'
import { buildUrlNoTimespan } from '../../utils/applicationInsightsUrlBuilder'
import trimForm from '../../utils/trim'
import logger from '../../../logger'
import startAllocationsMigrationValidator from './startAllocationsMigrationValidator'
import NomisPrisonerService from '../../services/nomisPrisonerService'
import ActivitiesService from '../../services/activitiesService'

interface Filter {
  prisonId?: string
  courseActivityId?: number
}

function context(res: Response): Context {
  return {
    username: res?.locals?.user?.username,
    token: res?.locals?.user?.token,
  }
}

export default class AllocationsMigrationController {
  constructor(
    private readonly nomisMigrationService: NomisMigrationService,
    private readonly nomisPrisonerService: NomisPrisonerService,
    private readonly activitiesService: ActivitiesService,
  ) {}

  async getAllocationsMigrations(req: Request, res: Response): Promise<void> {
    const { migrations } = await this.nomisMigrationService.getAllocationsMigrations(context(res))

    const decoratedMigrations = migrations.map(AllocationsMigrationController.withFilter).map(history => ({
      ...history,
      appInsightsAlreadyMigratedLink: AllocationsMigrationController.applicationInsightsUrlNoTimespan(
        AllocationsMigrationController.alreadyMigratedAppInsightsQuery(
          history.migrationId,
          history.whenStarted,
          history.whenEnded,
        ),
      ),
      appInsightsFailuresLink: AllocationsMigrationController.applicationInsightsUrlNoTimespan(
        AllocationsMigrationController.failedMigrationAppInsightsQuery(
          history.migrationId,
          history.whenStarted,
          history.whenEnded,
        ),
      ),
      appInsightsFullMigrationLink: AllocationsMigrationController.applicationInsightsUrlNoTimespan(
        AllocationsMigrationController.fullMigrationAppInsightsQuery(
          history.migrationId,
          history.whenStarted,
          history.whenEnded,
        ),
      ),
    }))
    res.render('pages/allocations/allocationsMigration', {
      migrations: decoratedMigrations,
      errors: [],
    })
  }

  async startNewAllocationsMigration(req: Request, res: Response): Promise<void> {
    delete req.session.startAllocationsMigrationForm
    if (req.query.prisonId || req.query.courseActivityId) {
      req.session.startAllocationsMigrationForm = { ...req.query }
    }
    await this.startAllocationsMigration(req, res)
  }

  async startAllocationsMigration(req: Request, res: Response): Promise<void> {
    res.render('pages/allocations/startAllocationsMigration', {
      form: req.session.startAllocationsMigrationForm,
      errors: req.flash('errors'),
    })
  }

  async postStartAllocationsMigration(req: Request, res: Response): Promise<void> {
    req.session.startAllocationsMigrationForm = { ...trimForm(req.body) }

    const errors = startAllocationsMigrationValidator(req.session.startAllocationsMigrationForm)

    if (errors.length > 0) {
      req.flash('errors', errors)
      res.redirect('/allocations-migration/amend')
    } else {
      const filter = AllocationsMigrationController.toFilter(req.session.startAllocationsMigrationForm)
      const activityCategories = await this.activitiesService.getActivityCategories(context(res))
      const count = await this.nomisPrisonerService.getAllocationsMigrationEstimatedCount(
        filter,
        activityCategories,
        context(res),
      )
      const dlqCountString = await this.nomisMigrationService.getAllocationsDLQMessageCount(context(res))
      logger.info(`${dlqCountString} failures found`)

      req.session.startAllocationsMigrationForm.estimatedCount = count.toLocaleString()
      req.session.startAllocationsMigrationForm.dlqCount = dlqCountString.toLocaleString()
      res.redirect('/allocations-migration/start/preview')
    }
  }

  async startAllocationsMigrationPreview(req: Request, res: Response): Promise<void> {
    res.render('pages/allocations/startAllocationsMigrationPreview', {
      form: req.session.startAllocationsMigrationForm,
    })
  }

  async postClearDLQAllocationsMigrationPreview(req: Request, res: Response): Promise<void> {
    const result = await this.nomisMigrationService.deleteAllocationsFailures(context(res))
    logger.info(`${result.messagesFoundCount} failures deleted`)
    req.body = { ...req.session.startAllocationsMigrationForm }
    await this.postStartAllocationsMigration(req, res)
  }

  async postStartAllocationsMigrationPreview(req: Request, res: Response): Promise<void> {
    const filter = AllocationsMigrationController.toFilter(req.session.startAllocationsMigrationForm)

    const result = await this.nomisMigrationService.startAllocationsMigration(filter, context(res))
    req.session.startAllocationsMigrationForm.estimatedCount = result.estimatedCount.toLocaleString()
    req.session.startAllocationsMigrationForm.migrationId = result.migrationId
    res.redirect('/allocations-migration/start/confirmation')
  }

  async startAllocationsMigrationConfirmation(req: Request, res: Response): Promise<void> {
    res.render('pages/allocations/startAllocationsMigrationConfirmation', {
      form: req.session.startAllocationsMigrationForm,
    })
  }

  async allocationsMigrationDetails(req: Request, res: Response): Promise<void> {
    const { migrationId } = req.query as { migrationId: string }
    const migration = await this.nomisMigrationService.getAllocationsMigration(migrationId, context(res))
    res.render('pages/allocations/allocationsMigrationDetails', {
      migration: { ...migration, history: AllocationsMigrationController.withFilter(migration.history) },
    })
  }

  async cancelMigration(req: Request, res: Response): Promise<void> {
    const { migrationId }: { migrationId: string } = req.body
    await this.nomisMigrationService.cancelAllocationsMigration(migrationId, context(res))
    const migration = await this.nomisMigrationService.getAllocationsMigration(migrationId, context(res))
    res.render('pages/allocations/allocationsMigrationDetails', {
      migration: { ...migration, history: AllocationsMigrationController.withFilter(migration.history) },
    })
  }

  private static toFilter(form: StartAllocationsMigrationForm): AllocationsMigrationFilter {
    return {
      prisonId: form.prisonId,
      courseActivityId: form.courseActivityId,
    }
  }

  private static alreadyMigratedAppInsightsQuery(migrationId: string, startedDate: string, endedDate: string): string {
    return `customEvents
      | where cloud_RoleName == 'hmpps-prisoner-from-nomis-migration'
      | where timestamp between (datetime(${this.toISODateTime(
        startedDate,
      )}) .. datetime(${this.toISODateTime(endedDate)}))
      | where customDimensions.migrationId startswith '${migrationId}'
      | where name endswith 'ignored'
      | join kind=leftouter (
        traces
        | where message startswith "Will not migrate"
      ) on $left.operation_Id==$right.operation_Id
      | project timestamp, name, message, migrationId=customDimensions.migrationId, off_prgref_id=customDimensions.nomisAllocationId, operation_Id
    `
  }

  private static fullMigrationAppInsightsQuery(migrationId: string, startedDate: string, endedDate: string): string {
    return `customEvents
      | where cloud_RoleName == 'hmpps-prisoner-from-nomis-migration'
      | where timestamp between (datetime(${this.toISODateTime(
        startedDate,
      )}) .. datetime(${this.toISODateTime(endedDate)}))
      | where customDimensions.migrationId startswith '${migrationId}'
    `
  }

  private static failedMigrationAppInsightsQuery(migrationId: string, startedDate: string, endedDate: string): string {
    return `customEvents
      | where cloud_RoleName == 'hmpps-prisoner-from-nomis-migration'
      | where timestamp between (datetime(${this.toISODateTime(
        startedDate,
      )}) .. datetime(${this.toISODateTime(endedDate)}))
      | where customDimensions.migrationId startswith '${migrationId}'
      | where (name endswith 'failed' or name endswith 'ignored' or name endswith 'error')
      | join kind=leftouter (
        traces
        | where (operation_Name == 'POST /migrate/allocation' and message startswith "Validation exception:") or (message startswith "Will not migrate")
      ) on $left.operation_Id==$right.operation_Id
      | project timestamp, name, message, migrationId=customDimensions.migrationId, off_prgref_id=customDimensions.nomisAllocationId, reason=customDimensions.reason, operation_Id
    `
  }

  private static toISODateTime(localDateTime: string): string {
    return moment(localDateTime).toISOString()
  }

  private static applicationInsightsUrlNoTimespan(query: string): string {
    return buildUrlNoTimespan(query)
  }

  private static withFilter(migration: MigrationHistory): MigrationHistory & {
    filterPrisonId?: string
    filterCourseActivityId?: number
  } {
    const filter: Filter = JSON.parse(migration.filter)
    const filterPrisonId = filter.prisonId
    const filterCourseActivityId = filter.courseActivityId
    return {
      ...migration,
      ...(filterPrisonId && { filterPrisonId }),
      ...(filterCourseActivityId && { filterCourseActivityId }),
    }
  }
}
