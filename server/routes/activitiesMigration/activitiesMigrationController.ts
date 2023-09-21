import { Request, Response } from 'express'
import { StartActivitiesMigrationForm } from 'express-session'
import moment from 'moment'
import NomisMigrationService, { Context } from '../../services/nomisMigrationService'
import { MigrationHistory, ActivitiesMigrationFilter } from '../../@types/migration'
import buildUrl from '../../utils/applicationInsightsUrlBuilder'
import trimForm from '../../utils/trim'
import logger from '../../../logger'
import startActivitiesMigrationValidator from './startActivitiesMigrationValidator'
import NomisPrisonerService from '../../services/nomisPrisonerService'

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

export default class ActivitiesMigrationController {
  constructor(
    private readonly nomisMigrationService: NomisMigrationService,
    private readonly nomisPrisonerService: NomisPrisonerService,
  ) {}

  async getActivitiesMigrations(req: Request, res: Response): Promise<void> {
    const { migrations } = await this.nomisMigrationService.getActivitiesMigrations(context(res))

    const decoratedMigrations = migrations.map(ActivitiesMigrationController.withFilter).map(history => ({
      ...history,
      applicationInsightsLink: ActivitiesMigrationController.applicationInsightsUrl(
        ActivitiesMigrationController.alreadyMigratedApplicationInsightsQuery(history.whenStarted, history.whenEnded),
      ),
    }))
    res.render('pages/activities/activitiesMigration', {
      migrations: decoratedMigrations,
      errors: [],
    })
  }

  async startNewActivitiesMigration(req: Request, res: Response): Promise<void> {
    delete req.session.startActivitiesMigrationForm
    await this.startActivitiesMigration(req, res)
  }

  async startActivitiesMigration(req: Request, res: Response): Promise<void> {
    res.render('pages/activities/startActivitiesMigration', {
      form: req.session.startActivitiesMigrationForm,
      errors: req.flash('errors'),
    })
  }

  async postStartActivitiesMigration(req: Request, res: Response): Promise<void> {
    req.session.startActivitiesMigrationForm = { ...trimForm(req.body) }

    const errors = startActivitiesMigrationValidator(req.session.startActivitiesMigrationForm)

    if (errors.length > 0) {
      req.flash('errors', errors)
      res.redirect('/activities-migration/amend')
    } else {
      const filter = ActivitiesMigrationController.toFilter(req.session.startActivitiesMigrationForm)
      const count = await this.nomisPrisonerService.getActivitiesMigrationEstimatedCount(filter, context(res))
      const dlqCountString = await this.nomisMigrationService.getActivitiesDLQMessageCount(context(res))
      logger.info(`${dlqCountString} failures found`)

      req.session.startActivitiesMigrationForm.estimatedCount = count.toLocaleString()
      req.session.startActivitiesMigrationForm.dlqCount = dlqCountString.toLocaleString()
      res.redirect('/activities-migration/start/preview')
    }
  }

  async startActivitiesMigrationPreview(req: Request, res: Response): Promise<void> {
    res.render('pages/activities/startActivitiesMigrationPreview', {
      form: req.session.startActivitiesMigrationForm,
    })
  }

  async postClearDLQActivitiesMigrationPreview(req: Request, res: Response): Promise<void> {
    const result = await this.nomisMigrationService.deleteActivitiesFailures(context(res))
    logger.info(`${result.messagesFoundCount} failures deleted`)
    req.body = { ...req.session.startActivitiesMigrationForm }
    await this.postStartActivitiesMigration(req, res)
  }

  async postStartActivitiesMigrationPreview(req: Request, res: Response): Promise<void> {
    const filter = ActivitiesMigrationController.toFilter(req.session.startActivitiesMigrationForm)

    const result = await this.nomisMigrationService.startActivitiesMigration(filter, context(res))
    req.session.startActivitiesMigrationForm.estimatedCount = result.estimatedCount.toLocaleString()
    req.session.startActivitiesMigrationForm.migrationId = result.migrationId
    res.redirect('/activities-migration/start/confirmation')
  }

  async startActivitiesMigrationConfirmation(req: Request, res: Response): Promise<void> {
    res.render('pages/activities/startActivitiesMigrationConfirmation', {
      form: req.session.startActivitiesMigrationForm,
    })
  }

  async activitiesMigrationDetails(req: Request, res: Response): Promise<void> {
    const { migrationId } = req.query as { migrationId: string }
    const migration = await this.nomisMigrationService.getActivitiesMigration(migrationId, context(res))
    res.render('pages/activities/activitiesMigrationDetails', {
      migration: { ...migration, history: ActivitiesMigrationController.withFilter(migration.history) },
    })
  }

  async viewFailures(req: Request, res: Response): Promise<void> {
    const failures = await this.nomisMigrationService.getActivitiesFailures(context(res))
    const failuresDecorated = {
      ...failures,
      messages: failures.messages.map(message => ({
        ...message,
        applicationInsightsLink: ActivitiesMigrationController.applicationInsightsUrl(
          ActivitiesMigrationController.messageApplicationInsightsQuery(message),
        ),
      })),
    }
    res.render('pages/activities/activitiesMigrationFailures', { failures: failuresDecorated })
  }

  async cancelMigration(req: Request, res: Response): Promise<void> {
    const { migrationId }: { migrationId: string } = req.body
    await this.nomisMigrationService.cancelActivitiesMigration(migrationId, context(res))
    const migration = await this.nomisMigrationService.getActivitiesMigration(migrationId, context(res))
    res.render('pages/activities/activitiesMigrationDetails', {
      migration: { ...migration, history: ActivitiesMigrationController.withFilter(migration.history) },
    })
  }

  private static toFilter(form: StartActivitiesMigrationForm): ActivitiesMigrationFilter {
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
    | where message contains 'Will not migrate the activity since it is migrated already,'
    | where timestamp between (datetime(${ActivitiesMigrationController.toISODateTime(
      startedDate,
    )}) .. datetime(${ActivitiesMigrationController.toISODateTime(endedDate)}))
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
