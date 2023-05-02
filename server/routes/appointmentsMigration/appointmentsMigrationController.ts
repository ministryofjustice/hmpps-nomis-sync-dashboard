import { Request, Response } from 'express'
import { StartAppointmentsMigrationForm } from 'express-session'
import moment from 'moment'
import NomisMigrationService, { Context } from '../../services/nomisMigrationService'
import { MigrationHistory, AppointmentsMigrationFilter } from '../../@types/migration'
import buildUrl from '../../utils/applicationInsightsUrlBuilder'
import trimForm from '../../utils/trim'
import logger from '../../../logger'
import startAppointmentsMigrationValidator from './startAppointmentsMigrationValidator'
import NomisPrisonerService from '../../services/nomisPrisonerService'
import { AppointmentsMigrationViewFilter } from '../../@types/dashboard'

interface Filter {
  prisonIds?: string[]
  fromDate?: string
  toDate?: string
}

function context(res: Response): Context {
  return {
    username: res?.locals?.user?.username,
    token: res?.locals?.user?.token,
  }
}

export default class AppointmentsMigrationController {
  constructor(
    private readonly nomisMigrationService: NomisMigrationService,
    private readonly nomisPrisonerService: NomisPrisonerService,
  ) {}

  async getAppointmentsMigrations(req: Request, res: Response): Promise<void> {
    const searchFilter = this.parseFilter(req)

    const { migrations } = await this.nomisMigrationService.getAppointmentsMigrations(context(res))

    const decoratedMigrations = migrations.map(history => ({
      ...history,
      applicationInsightsLink: AppointmentsMigrationController.applicationInsightsUrl(
        AppointmentsMigrationController.alreadyMigratedApplicationInsightsQuery(history.whenStarted, history.whenEnded),
      ),
    }))
    res.render('pages/appointments/appointmentsMigration', {
      migrations: decoratedMigrations,
      migrationViewFilter: searchFilter,
      errors: [],
    })
  }

  async startNewAppointmentsMigration(req: Request, res: Response): Promise<void> {
    delete req.session.startAppointmentsMigrationForm
    await this.startAppointmentsMigration(req, res)
  }

  async startAppointmentsMigration(req: Request, res: Response): Promise<void> {
    res.render('pages/appointments/startAppointmentsMigration', {
      form: req.session.startAppointmentsMigrationForm,
      errors: req.flash('errors'),
    })
  }

  async postStartAppointmentsMigration(req: Request, res: Response): Promise<void> {
    req.session.startAppointmentsMigrationForm = { ...trimForm(req.body) }

    const errors = startAppointmentsMigrationValidator(req.session.startAppointmentsMigrationForm)

    if (errors.length > 0) {
      req.flash('errors', errors)
      res.redirect('/appointments-migration/amend')
    } else {
      const filter = AppointmentsMigrationController.toFilter(req.session.startAppointmentsMigrationForm)
      const count = await this.nomisPrisonerService.getAppointmentsMigrationEstimatedCount(filter, context(res))
      const dlqCountString = await this.nomisMigrationService.getAppointmentsDLQMessageCount(context(res))
      logger.info(`${dlqCountString} failures found`)

      req.session.startAppointmentsMigrationForm.estimatedCount = count.toLocaleString()
      req.session.startAppointmentsMigrationForm.dlqCount = dlqCountString.toLocaleString()
      res.redirect('/appointments-migration/start/preview')
    }
  }

  async startAppointmentsMigrationPreview(req: Request, res: Response): Promise<void> {
    res.render('pages/appointments/startAppointmentsMigrationPreview', {
      form: req.session.startAppointmentsMigrationForm,
    })
  }

  async postClearDLQAppointmentsMigrationPreview(req: Request, res: Response): Promise<void> {
    const result = await this.nomisMigrationService.deleteAppointmentsFailures(context(res))
    logger.info(`${result.messagesFoundCount} failures deleted`)
    req.body = { ...req.session.startAppointmentsMigrationForm }
    await this.postStartAppointmentsMigration(req, res)
  }

  async postStartAppointmentsMigrationPreview(req: Request, res: Response): Promise<void> {
    const filter = AppointmentsMigrationController.toFilter(req.session.startAppointmentsMigrationForm)

    const result = await this.nomisMigrationService.startAppointmentsMigration(filter, context(res))
    req.session.startAppointmentsMigrationForm.estimatedCount = result.estimatedCount.toLocaleString()
    req.session.startAppointmentsMigrationForm.migrationId = result.migrationId
    res.redirect('/appointments-migration/start/confirmation')
  }

  async startAppointmentsMigrationConfirmation(req: Request, res: Response): Promise<void> {
    res.render('pages/appointments/startAppointmentsMigrationConfirmation', {
      form: req.session.startAppointmentsMigrationForm,
    })
  }

  async appointmentsMigrationDetails(req: Request, res: Response): Promise<void> {
    const { migrationId } = req.query as { migrationId: string }
    const migration = await this.nomisMigrationService.getAppointmentsMigration(migrationId, context(res))
    res.render('pages/appointments/appointmentsMigrationDetails', {
      migration: { ...migration, history: AppointmentsMigrationController.withFilter(migration.history) },
    })
  }

  async viewFailures(req: Request, res: Response): Promise<void> {
    const failures = await this.nomisMigrationService.getAppointmentsFailures(context(res))
    const failuresDecorated = {
      ...failures,
      messages: failures.messages.map(message => ({
        ...message,
        applicationInsightsLink: AppointmentsMigrationController.applicationInsightsUrl(
          AppointmentsMigrationController.messageApplicationInsightsQuery(message),
        ),
      })),
    }
    res.render('pages/appointments/appointmentsMigrationFailures', { failures: failuresDecorated })
  }

  async cancelMigration(req: Request, res: Response): Promise<void> {
    const { migrationId }: { migrationId: string } = req.body
    await this.nomisMigrationService.cancelAppointmentsMigration(migrationId, context(res))
    const migration = await this.nomisMigrationService.getAppointmentsMigration(migrationId, context(res))
    res.render('pages/appointments/appointmentsMigrationDetails', {
      migration: { ...migration, history: AppointmentsMigrationController.withFilter(migration.history) },
    })
  }

  private static toFilter(form: StartAppointmentsMigrationForm): AppointmentsMigrationFilter {
    return {
      prisonIds: AppointmentsMigrationController.asArray(form.prisonIds),
      fromDate: form.fromDate,
      toDate: form.toDate,
    }
  }

  private static asArray(value: string | string[]): string[] {
    if (typeof value === 'string') {
      return value.split(',').map((v: string) => v.trim())
    }
    return value
  }

  parseFilter(req: Request): AppointmentsMigrationViewFilter {
    return {
      prisonId: req.query.prisonId as string | undefined,
      toDateTime: req.query.toDateTime as string | undefined,
      fromDateTime: req.query.fromDateTime as string | undefined,
      includeOnlyFailures: (req.query.includeOnlyFailures as string) === 'true',
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
    | where message contains 'Will not migrate the adjustment since it is migrated already,'
    | where timestamp between (datetime(${AppointmentsMigrationController.toISODateTime(
      startedDate,
    )}) .. datetime(${AppointmentsMigrationController.toISODateTime(endedDate)}))
    | summarize dcount(message)`
  }

  private static toISODateTime(localDateTime: string): string {
    return moment(localDateTime).toISOString()
  }

  private static applicationInsightsUrl(query: string): string {
    return buildUrl(query, 'P1D')
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
