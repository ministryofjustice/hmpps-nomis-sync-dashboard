import { Request, Response } from 'express'
import { StartAppointmentsMigrationForm } from 'express-session'
import moment from 'moment'
import { context } from '../../services/context'
import NomisMigrationService from '../../services/nomisMigrationService'
import { MigrationHistory, AppointmentsMigrationFilter } from '../../@types/migration'
import { buildUrl } from '../../utils/applicationInsightsUrlBuilder'
import trimForm from '../../utils/trim'
import logger from '../../../logger'
import startAppointmentsMigrationValidator from './startAppointmentsMigrationValidator'
import NomisPrisonerService from '../../services/nomisPrisonerService'
import { AppointmentCountsResponse } from '../../@types/nomisPrisoner'
import AppointmentsNomisMigrationService from '../../services/appointments/appointmentsNomisMigrationService'

interface Filter {
  prisonIds?: string[]
  fromDate?: string
  toDate?: string
}

export default class AppointmentsMigrationController {
  constructor(
    private readonly appointmentsNomisMigrationService: AppointmentsNomisMigrationService,
    private readonly nomisMigrationService: NomisMigrationService,
    private readonly nomisPrisonerService: NomisPrisonerService,
  ) {}

  private migrationType: string = 'APPOINTMENTS'

  async getAppointmentsMigrations(_: Request, res: Response): Promise<void> {
    const { migrations } = await this.nomisMigrationService.getMigrationHistory(this.migrationType, context(res))

    const decoratedMigrations = migrations.map(AppointmentsMigrationController.withFilter).map(history => ({
      ...history,
      applicationInsightsLink: AppointmentsMigrationController.applicationInsightsUrl(
        AppointmentsMigrationController.alreadyMigratedApplicationInsightsQuery(history.whenStarted, history.whenEnded),
      ),
    }))
    res.render('pages/appointments/appointmentsMigration', {
      migrations: decoratedMigrations,
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

  async postActivatePrison(req: Request, res: Response): Promise<void> {
    const { serviceName, prisonId } = req.query as { serviceName: string; prisonId: string }
    await this.nomisPrisonerService.createServiceAgencySwitch(prisonId, serviceName, context(res))
    res.redirect('/appointments-migration/amend')
  }

  async postStartAppointmentsMigration(req: Request, res: Response): Promise<void> {
    req.session.startAppointmentsMigrationForm = { ...trimForm(req.body) }

    const errors = startAppointmentsMigrationValidator(req.session.startAppointmentsMigrationForm)

    if (errors.length > 0) {
      req.flash('errors', errors)
      res.redirect('/appointments-migration/amend')
    } else {
      await this.previewChecks(req, res, errors)
      if (errors.length > 0) {
        req.flash('errors', errors)
      }
      res.redirect('/appointments-migration/start/preview')
    }
  }

  async previewChecks(req: Request, res: Response, errors: Express.ValidationError[]): Promise<void> {
    const filter = AppointmentsMigrationController.toFilter(req.session.startAppointmentsMigrationForm)
    await Promise.all([
      this.nomisPrisonerService.getAppointmentsMigrationEstimatedCount(filter, context(res)).catch(error => {
        errors.push({ text: `Failed to get count due to error: ${error.data.userMessage}`, href: '' })
        return 0
      }),

      this.nomisMigrationService.getFailureCount(this.migrationType, context(res)).catch(error => {
        errors.push({
          text: `Failed to get DLQ count due to error: ${error.data?.message || error.message}`,
          href: '',
        })
        return 0
      }),

      this.getInactiveNomisPrisons(filter, res, errors),

      this.nomisPrisonerService
        .findAppointmentCounts(filter, context(res))
        .catch((error): AppointmentCountsResponse[] => {
          errors.push({
            text: `Failed to find appointment summary counts due to error: ${error.data.userMessage}`,
            href: '',
          })
          return []
        }),
    ]).then(([estimatedCount, dlqCount, inactiveNomisPrisons, appointmentCounts]) => {
      req.session.startAppointmentsMigrationForm.estimatedCount = estimatedCount.toLocaleString()
      req.session.startAppointmentsMigrationForm.dlqCount = dlqCount.toLocaleString()
      req.session.startAppointmentsMigrationForm.prisonsNotSwitchedOnNomis = inactiveNomisPrisons
      req.session.startAppointmentsMigrationForm.appointmentCounts = this.appointmentCountsCsv(appointmentCounts)
    })
  }

  private async getInactiveNomisPrisons(
    filter: AppointmentsMigrationFilter,
    res: Response,
    errors: Express.ValidationError[],
  ): Promise<string[]> {
    return (
      await Promise.all(
        filter.prisonIds.map(async prisonId => {
          const switchedOn = await this.nomisPrisonerService
            .checkServiceAgencySwitch(prisonId, 'APPOINTMENTS', context(res))
            .catch(error => {
              errors.push({
                text: `Failed to check if APPOINTMENTS feature switch turned on for ${prisonId}: ${error.data.userMessage}`,
                href: '',
              })
              return 'Error checking APPOINTMENTS feature switch'
            })
          return { prisonId, switchedOn }
        }),
      )
    )
      .filter(prisonSwitch => prisonSwitch.switchedOn === false)
      .map(({ prisonId }) => prisonId)
  }

  private appointmentCountsCsv(appointmentCounts: AppointmentCountsResponse[]): string[] {
    if (appointmentCounts.length === 0) return []
    const body = appointmentCounts
      .map(
        (appointmentCount: AppointmentCountsResponse) =>
          `${appointmentCount.prisonId}, ${appointmentCount.eventSubType}, ${appointmentCount.future}, ${appointmentCount.count},`,
      )
      .sort()
    body.unshift(`Prison, Event Sub Type, Future appointment?, Count,`)
    return body
  }

  async startAppointmentsMigrationPreview(req: Request, res: Response): Promise<void> {
    res.render('pages/appointments/startAppointmentsMigrationPreview', {
      form: req.session.startAppointmentsMigrationForm,
    })
  }

  async postClearDLQAppointmentsMigrationPreview(req: Request, res: Response): Promise<void> {
    const result = await this.nomisMigrationService.deleteFailures(this.migrationType, context(res))
    logger.info(`${result.messagesFoundCount} failures deleted`)
    req.body = { ...req.session.startAppointmentsMigrationForm }
    await this.postStartAppointmentsMigration(req, res)
  }

  async postStartAppointmentsMigrationPreview(req: Request, res: Response): Promise<void> {
    const filter = AppointmentsMigrationController.toFilter(req.session.startAppointmentsMigrationForm)

    const result = await this.appointmentsNomisMigrationService.startAppointmentsMigration(filter, context(res))
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
    const migration = await this.nomisMigrationService.getMigration(migrationId, context(res))
    res.render('pages/appointments/appointmentsMigrationDetails', {
      migration: { ...migration, history: AppointmentsMigrationController.withFilter(migration.history) },
    })
  }

  async viewFailures(_: Request, res: Response): Promise<void> {
    const failures = await this.nomisMigrationService.getFailures(this.migrationType, context(res))
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
    await this.nomisMigrationService.cancelMigration(migrationId, context(res))
    const migration = await this.nomisMigrationService.getMigration(migrationId, context(res))
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

  private static messageApplicationInsightsQuery(message: { messageId: string }): string {
    return `exceptions
    | where cloud_RoleName == 'hmpps-prisoner-from-nomis-migration'
    | where customDimensions.["Logger Message"] == "MessageID:${message.messageId}"
    | order by timestamp desc`
  }

  private static alreadyMigratedApplicationInsightsQuery(startedDate: string, endedDate: string): string {
    return `traces
    | where cloud_RoleName == 'hmpps-prisoner-from-nomis-migration'
    | where message contains 'Will not migrate the appointment since it is migrated already,'
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
