import { Request, Response } from 'express'
import { StartAllocationsMigrationForm } from 'express-session'
import moment from 'moment'
import { context } from '../../services/context'
import NomisMigrationService from '../../services/nomisMigrationService'
import { MigrationHistory, AllocationsMigrationFilter } from '../../@types/migration'
import { buildUrlNoTimespan } from '../../utils/applicationInsightsUrlBuilder'
import trimForm from '../../utils/trim'
import logger from '../../../logger'
import startAllocationsMigrationValidator from './startAllocationsMigrationValidator'
import NomisPrisonerService from '../../services/nomisPrisonerService'
import AllocationsNomisMigrationService from '../../services/allocations/allocationsNomisMigrationService'

interface Filter {
  prisonId?: string
  courseActivityId?: number
  activityStartDate?: string
}

export default class AllocationsMigrationController {
  constructor(
    private readonly allocationsNomisMigrationService: AllocationsNomisMigrationService,
    private readonly nomisMigrationService: NomisMigrationService,
    private readonly nomisPrisonerService: NomisPrisonerService,
  ) {}

  private migrationType: string = 'ALLOCATIONS'

  async getAllocationsMigrations(_: Request, res: Response): Promise<void> {
    const { migrations } = await this.nomisMigrationService.getMigrationHistory(this.migrationType, context(res))

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
    req.session.startAllocationsMigrationForm = { protectStartDate: false }
    if (req.query.prisonId || req.query.courseActivityId || req.query.activityStartDate) {
      req.session.startAllocationsMigrationForm = { ...req.query, protectStartDate: !!req.query.activityStartDate }
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
      const count = await this.nomisPrisonerService.getAllocationsMigrationEstimatedCount(filter, context(res))
      const dlqCountString = await this.nomisMigrationService.getFailureCount(this.migrationType, context(res))
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
    const result = await this.nomisMigrationService.deleteFailures(this.migrationType, context(res))
    logger.info(`${result.messagesFoundCount} failures deleted`)
    req.body = { ...req.session.startAllocationsMigrationForm }
    await this.postStartAllocationsMigration(req, res)
  }

  async postStartAllocationsMigrationPreview(req: Request, res: Response): Promise<void> {
    const filter = AllocationsMigrationController.toFilter(req.session.startAllocationsMigrationForm)

    const result = await this.allocationsNomisMigrationService.startAllocationsMigration(filter, context(res))
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
    const migration = await this.nomisMigrationService.getMigration(migrationId, context(res))
    res.render('pages/allocations/allocationsMigrationDetails', {
      migration: { ...migration, history: AllocationsMigrationController.withFilter(migration.history) },
    })
  }

  async cancelMigration(req: Request, res: Response): Promise<void> {
    const { migrationId }: { migrationId: string } = req.body
    await this.nomisMigrationService.cancelMigration(migrationId, context(res))
    const migration = await this.nomisMigrationService.getMigration(migrationId, context(res))
    res.render('pages/allocations/allocationsMigrationDetails', {
      migration: { ...migration, history: AllocationsMigrationController.withFilter(migration.history) },
    })
  }

  private static toFilter(form: StartAllocationsMigrationForm): AllocationsMigrationFilter {
    return {
      prisonId: form.prisonId,
      courseActivityId: form.courseActivityId,
      activityStartDate: form.activityStartDate,
    }
  }

  private static fullMigrationAppInsightsQuery(migrationId: string, startedDate: string, endedDate: string): string {
    const startDateQuery = `datetime(${this.toISODateTime(startedDate)})`
    const endDateQuery = endedDate ? `datetime(${this.toISODateTime(endedDate)})` : `now()`
    return `customEvents
      | where cloud_RoleName == 'hmpps-prisoner-from-nomis-migration'
      | where timestamp between (${startDateQuery} .. ${endDateQuery})
      | where customDimensions.migrationId startswith '${migrationId}'
      | where name startswith 'activity-allocation-migration'
    `.trim()
  }

  private static alreadyMigratedAppInsightsQuery(migrationId: string, startedDate: string, endedDate: string): string {
    return `${this.fullMigrationAppInsightsQuery(migrationId, startedDate, endedDate)}
      | where name endswith 'ignored'
      | join kind=leftouter (
        traces
        | where timestamp between (datetime(${this.toISODateTime(
          startedDate,
        )}) .. datetime(${this.toISODateTime(endedDate)}))
        | where message startswith "Will not migrate"
      ) on $left.operation_Id==$right.operation_Id
      | project timestamp, name, message, migrationId=customDimensions.migrationId, off_prgref_id=customDimensions.nomisAllocationId, operation_Id
    `
  }

  private static failedMigrationAppInsightsQuery(migrationId: string, startedDate: string, endedDate: string): string {
    return `${this.fullMigrationAppInsightsQuery(migrationId, startedDate, endedDate)}
      | where (name endswith 'failed' or name endswith 'error')
      | join kind=leftouter (
        traces
        | where timestamp between (datetime(${this.toISODateTime(
          startedDate,
        )}) .. datetime(${this.toISODateTime(endedDate)}))
        | where operation_Name == 'POST /migrate/allocation' and (message startswith "Validation exception:" or message startswith "Exception:")
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
    filterActivityStartDate?: string
  } {
    const filter: Filter = JSON.parse(migration.filter)
    const filterPrisonId = filter.prisonId
    const filterCourseActivityId = filter.courseActivityId
    const filterActivityStartDate = filter.activityStartDate
    return {
      ...migration,
      ...(filterPrisonId && { filterPrisonId }),
      ...(filterCourseActivityId && { filterCourseActivityId }),
      ...(filterActivityStartDate && { filterActivityStartDate }),
    }
  }
}
