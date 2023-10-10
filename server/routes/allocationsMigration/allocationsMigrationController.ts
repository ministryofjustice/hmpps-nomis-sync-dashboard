import { Request, Response } from 'express'
import { StartAllocationsMigrationForm } from 'express-session'
import moment from 'moment'
import NomisMigrationService, { Context } from '../../services/nomisMigrationService'
import { MigrationHistory, AllocationsMigrationFilter } from '../../@types/migration'
import buildUrl from '../../utils/applicationInsightsUrlBuilder'
import trimForm from '../../utils/trim'
import logger from '../../../logger'
import startAllocationsMigrationValidator from './startAllocationsMigrationValidator'

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
  constructor(private readonly nomisMigrationService: NomisMigrationService) {}

  async getAllocationsMigrations(req: Request, res: Response): Promise<void> {
    const { migrations } = await this.nomisMigrationService.getAllocationsMigrations(context(res))

    const decoratedMigrations = migrations.map(AllocationsMigrationController.withFilter).map(history => ({
      ...history,
      applicationInsightsLink: AllocationsMigrationController.applicationInsightsUrl(
        AllocationsMigrationController.alreadyMigratedApplicationInsightsQuery(history.whenStarted, history.whenEnded),
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
      const count = await this.nomisMigrationService.getAllocationsMigrationEstimatedCount(filter, context(res))
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

  async viewFailures(req: Request, res: Response): Promise<void> {
    const failures = await this.nomisMigrationService.getAllocationsFailures(context(res))
    const failuresDecorated = {
      ...failures,
      messages: failures.messages.map(message => ({
        ...message,
        applicationInsightsLink: AllocationsMigrationController.applicationInsightsUrl(
          AllocationsMigrationController.messageApplicationInsightsQuery(message),
        ),
      })),
    }
    res.render('pages/allocations/allocationsMigrationFailures', { failures: failuresDecorated })
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

  private static messageApplicationInsightsQuery(message: { messageId: string }): string {
    return `exceptions
    | where cloud_RoleName == 'hmpps-prisoner-from-nomis-migration' 
    | where customDimensions.["Logger Message"] == "MessageID:${message.messageId}"
    | order by timestamp desc`
  }

  private static alreadyMigratedApplicationInsightsQuery(startedDate: string, endedDate: string): string {
    return `traces
    | where cloud_RoleName == 'hmpps-prisoner-from-nomis-migration' 
    | where message startswith 'Will not migrate the courseActivityId'
    | where timestamp between (datetime(${AllocationsMigrationController.toISODateTime(
      startedDate,
    )}) .. datetime(${AllocationsMigrationController.toISODateTime(endedDate)}))
    | summarize dcount(message)`
  }

  private static toISODateTime(localDateTime: string): string {
    return moment(localDateTime).toISOString()
  }

  private static applicationInsightsUrl(query: string): string {
    return buildUrl(query, 'P1D')
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
