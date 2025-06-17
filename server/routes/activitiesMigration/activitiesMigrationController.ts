import { Request, Response } from 'express'
import { StartActivitiesMigrationForm } from 'express-session'
import moment from 'moment'
import { context } from '../../services/context'
import NomisMigrationService from '../../services/nomisMigrationService'
import { ActivitiesMigrationFilter, MigrationHistory } from '../../@types/migration'
import { buildUrlNoTimespan } from '../../utils/applicationInsightsUrlBuilder'
import trimForm from '../../utils/trim'
import logger from '../../../logger'
import startActivitiesMigrationValidator from './startActivitiesMigrationValidator'
import moveActivityStartDateValidator from './moveActivityStartDateValidator'
import NomisPrisonerService from '../../services/nomisPrisonerService'
import {
  FindAllocationsMissingPayBandsResponse,
  FindPayRateWithUnknownIncentiveResponse,
  FindActivitiesWithoutScheduleRulesResponse,
  FindSuspendedAllocationsResponse,
  IncentiveLevel,
} from '../../@types/nomisPrisoner'
import ActivitiesService from '../../services/activitiesService'
import { RolloutPrisonPlan } from '../../@types/activities'
import ActivitiesNomisMigrationService from '../../services/activities/activitiesNomisMigrationService'

interface Filter {
  prisonId?: string
  activityStartDate?: string
  nomisActivityEndDate?: string
  courseActivityId?: number
}

export default class ActivitiesMigrationController {
  constructor(
    private readonly activitiesNomisMigrationService: ActivitiesNomisMigrationService,
    private readonly nomisMigrationService: NomisMigrationService,
    private readonly nomisPrisonerService: NomisPrisonerService,
    private readonly activitiesService: ActivitiesService,
  ) {}

  private migrationType: string = 'ACTIVITIES'

  async getActivitiesMigrations(req: Request, res: Response): Promise<void> {
    const { migrations } = await this.nomisMigrationService.getMigrationHistory(this.migrationType, context(res))

    const decoratedMigrations = migrations.map(ActivitiesMigrationController.withFilter).map(history => ({
      ...history,
      appInsightsActivityIgnoredLink: ActivitiesMigrationController.applicationInsightsUrlNoTimespan(
        ActivitiesMigrationController.activityIgnoredAppInsightsQuery(
          history.migrationId,
          history.whenStarted,
          history.whenEnded,
        ),
      ),
      appInsightsFailuresLink: ActivitiesMigrationController.applicationInsightsUrlNoTimespan(
        ActivitiesMigrationController.failedMigrationAppInsightsQuery(
          history.migrationId,
          history.whenStarted,
          history.whenEnded,
        ),
      ),
      appInsightsFullMigrationLink: ActivitiesMigrationController.applicationInsightsUrlNoTimespan(
        ActivitiesMigrationController.fullMigrationAppInsightsQuery(
          history.migrationId,
          history.whenStarted,
          history.whenEnded,
        ),
      ),
      dateAction: (() => {
        if (!history.filterNomisActivityEndDate) {
          return 'END'
        }
        if (!history.filterCourseActivityId && moment(history.filterActivityStartDate) > moment()) {
          return 'MOVE'
        }
        return 'NONE'
      })(),
    }))
    res.render('pages/activities/activitiesMigration', {
      migrations: decoratedMigrations,
      endMigratedActivitiesResult: req.session.endMigratedActivitiesResult,
      errors: [],
      warnings: req.flash('warnings'),
    })
  }

  async startNewActivitiesMigration(req: Request, res: Response): Promise<void> {
    req.session.startActivitiesMigrationForm = { activityStartDate: moment().add(1, 'days').format('YYYY-MM-DD') }
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
      await this.previewChecks(req, res, errors)
      if (errors.length > 0) {
        req.flash('errors', errors)
      }
      res.redirect('/activities-migration/start/preview')
    }
  }

  async previewChecks(req: Request, res: Response, errors: Express.ValidationError[]): Promise<void> {
    const { prisonId } = req.session.startActivitiesMigrationForm
    const filter = ActivitiesMigrationController.toFilter(req.session.startActivitiesMigrationForm)
    await Promise.all([
      this.nomisPrisonerService.getActivitiesMigrationEstimatedCount(filter, context(res)).catch(error => {
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

      this.nomisPrisonerService.getPrisonIncentiveLevels(prisonId, context(res)).catch((error): IncentiveLevel[] => {
        errors.push({ text: `Failed to check incentive levels due to error: ${error.data.userMessage}`, href: '' })
        return []
      }),

      this.nomisPrisonerService.checkServiceAgencySwitch(prisonId, 'ACTIVITY', context(res)).catch(error => {
        errors.push({
          text: `Failed to check if ACTIVITY feature switch turned on for ${prisonId}: ${error.data.userMessage}`,
          href: '',
        })
        return 'Error checking ACTIVITY feature switch'
      }),

      this.activitiesService.getRolloutPrison(prisonId, context(res)).catch((error): RolloutPrisonPlan => {
        errors.push({
          text: `Failed to check if prison ${prisonId} is switched on in DPS due to error: ${error.message}`,
          href: '',
        })
        return null
      }),

      this.activitiesService.checkPrisonPayBandsExist(prisonId, context(res)).catch((error): null => {
        errors.push({
          text: `Failed to check if prison ${prisonId} has pay bands in DPS due to error: ${error.message}`,
          href: '',
        })
        return null
      }),

      this.activitiesService.checkPrisonRegimeExists(prisonId, context(res)).catch((error): boolean => {
        errors.push({
          text: `Failed to check if prison ${prisonId} has slot times configured in DPS due to error: ${error.message}`,
          href: '',
        })
        return null
      }),

      this.nomisPrisonerService
        .findActivitiesSuspendedAllocations(filter, context(res))
        .catch((error): FindSuspendedAllocationsResponse[] => {
          errors.push({
            text: `Failed to find suspended allocations due to error: ${error.message}`,
            href: '',
          })
          return []
        }),

      this.nomisPrisonerService
        .findAllocationsWithMissingPayBands(filter, context(res))
        .catch((error): FindAllocationsMissingPayBandsResponse[] => {
          errors.push({
            text: `Failed to find allocations with missing pay bands due to error: ${error.message}`,
            href: '',
          })
          return []
        }),

      this.nomisPrisonerService
        .findPayRatesWithUnknownIncentive(filter, context(res))
        .catch((error): FindPayRateWithUnknownIncentiveResponse[] => {
          errors.push({
            text: `Failed to find pay rates with unknown incentive due to error: ${error.message}`,
            href: '',
          })
          return []
        }),

      this.nomisPrisonerService
        .findActivitiesWithoutScheduleRules(filter, context(res))
        .catch((error): FindActivitiesWithoutScheduleRulesResponse[] => {
          errors.push({
            text: `Failed to find activities without schedule rules due to error: ${error.message}`,
            href: '',
          })
          return []
        }),
    ]).then(
      ([
        estimatedCount,
        dlqCount,
        incentiveLevels,
        nomisFeatureSwitchOn,
        dpsPrisonRollout,
        dpsPayBandsExist,
        dpsPrisonRegimeExists,
        nomisSuspendedAllocations,
        nomisAllocationsMissingPayBands,
        nomisPayRatesUnknownIncentive,
        nomisActivitiesWithoutScheduleRules,
      ]) => {
        req.session.startActivitiesMigrationForm.estimatedCount = estimatedCount.toLocaleString()
        req.session.startActivitiesMigrationForm.dlqCount = dlqCount.toLocaleString()
        req.session.startActivitiesMigrationForm.incentiveLevelIds = incentiveLevels.map(
          (level: IncentiveLevel) => level.code,
        )
        req.session.startActivitiesMigrationForm.prisonSwitchedOnNomis = nomisFeatureSwitchOn
        req.session.startActivitiesMigrationForm.prisonSwitchedOnDps =
          dpsPrisonRollout === null || dpsPrisonRollout.activitiesRolledOut
        req.session.startActivitiesMigrationForm.dpsPayBandsExist = dpsPayBandsExist === null || dpsPayBandsExist
        req.session.startActivitiesMigrationForm.dpsPrisonRegimeExists =
          dpsPrisonRegimeExists === null || dpsPrisonRegimeExists
        req.session.startActivitiesMigrationForm.suspendedAllocations =
          this.suspendedAllocationCsv(nomisSuspendedAllocations)
        req.session.startActivitiesMigrationForm.allocationsMissingPayBands = this.allocationMissingPayBandsCsv(
          nomisAllocationsMissingPayBands,
        )
        req.session.startActivitiesMigrationForm.payRatesUnknownIncentive =
          this.payRatesUnknownIncentiveCsv(nomisPayRatesUnknownIncentive)
        req.session.startActivitiesMigrationForm.activitiesWithoutScheduleRules =
          this.activitiesWithoutScheduleRulesCsv(nomisActivitiesWithoutScheduleRules)
      },
    )
  }

  private suspendedAllocationCsv(allocations: FindSuspendedAllocationsResponse[]): string[] {
    if (allocations.length === 0) return []
    const body = allocations
      .map(
        (allocation: FindSuspendedAllocationsResponse) =>
          `${allocation.courseActivityDescription}, ${allocation.courseActivityId}, ${allocation.offenderNo},`,
      )
      .sort()
    body.unshift(`Activity Description, Activity ID, Prisoner Number,`)
    return body
  }

  private allocationMissingPayBandsCsv(allocations: FindAllocationsMissingPayBandsResponse[]): string[] {
    if (allocations.length === 0) return []
    const body = allocations
      .map(
        (allocation: FindAllocationsMissingPayBandsResponse) =>
          `${allocation.courseActivityDescription}, ${allocation.courseActivityId}, ${allocation.offenderNo}, ${allocation.incentiveLevel},`,
      )
      .sort()
    body.unshift(`Activity Description, Activity ID, Prisoner Number, Incentive Level,`)
    return body
  }

  private payRatesUnknownIncentiveCsv(payRates: FindPayRateWithUnknownIncentiveResponse[]): string[] {
    if (payRates.length === 0) return []
    const body = payRates
      .map(
        (payRate: FindPayRateWithUnknownIncentiveResponse) =>
          `${payRate.courseActivityDescription}, ${payRate.courseActivityId}, ${payRate.payBandCode}, ${payRate.incentiveLevelCode},`,
      )
      .sort()
    body.unshift(`Activity Description, Activity ID, Pay Band Code, Incentive Level,`)
    return body
  }

  private activitiesWithoutScheduleRulesCsv(activities: FindActivitiesWithoutScheduleRulesResponse[]): string[] {
    if (activities.length === 0) return []
    const body = activities
      .map(
        (activity: FindActivitiesWithoutScheduleRulesResponse) =>
          `${activity.courseActivityDescription}, ${activity.courseActivityId},`,
      )
      .sort()
    body.unshift(`Activity Description, Activity ID,`)
    return body
  }

  async startActivitiesMigrationPreview(req: Request, res: Response): Promise<void> {
    res.render('pages/activities/startActivitiesMigrationPreview', {
      form: req.session.startActivitiesMigrationForm,
      errors: req.flash('errors'),
    })
  }

  async postClearDLQActivitiesMigrationPreview(req: Request, res: Response): Promise<void> {
    const result = await this.nomisMigrationService.deleteFailures(this.migrationType, context(res))
    logger.info(`${result.messagesFoundCount} failures deleted`)
    req.body = { ...req.session.startActivitiesMigrationForm }
    await this.postStartActivitiesMigration(req, res)
  }

  async postEndMigratedActivities(req: Request, res: Response): Promise<void> {
    const { migrationId } = req.query as { migrationId: string }
    const result = await this.activitiesNomisMigrationService.endMigratedActivities(context(res), migrationId)
    req.session.endMigratedActivitiesResult = { migrationId, result }
    res.redirect('/activities-migration')
  }

  async postActivatePrison(req: Request, res: Response): Promise<void> {
    const { serviceName, prisonId } = req.query as { serviceName: string; prisonId: string }
    await this.nomisPrisonerService.createServiceAgencySwitch(prisonId, serviceName, context(res))
    res.redirect('/activities-migration/amend')
  }

  async postStartActivitiesMigrationPreview(req: Request, res: Response): Promise<void> {
    const filter = ActivitiesMigrationController.toFilter(req.session.startActivitiesMigrationForm)

    const result = await this.activitiesNomisMigrationService.startActivitiesMigration(filter, context(res))
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
    const migration = await this.nomisMigrationService.getMigration(migrationId, context(res))
    res.render('pages/activities/activitiesMigrationDetails', {
      migration: { ...migration, history: ActivitiesMigrationController.withFilter(migration.history) },
    })
  }

  async cancelMigration(req: Request, res: Response): Promise<void> {
    const { migrationId }: { migrationId: string } = req.body
    await this.nomisMigrationService.cancelMigration(migrationId, context(res))
    const migration = await this.nomisMigrationService.getMigration(migrationId, context(res))
    res.render('pages/activities/activitiesMigrationDetails', {
      migration: { ...migration, history: ActivitiesMigrationController.withFilter(migration.history) },
    })
  }

  async startMoveStartDate(req: Request, res: Response): Promise<void> {
    const { migrationId } = req.query as { migrationId: string }

    const migration = await this.nomisMigrationService.getMigration(migrationId, context(res))
    const history = ActivitiesMigrationController.withFilter(migration.history)
    req.session.activityMigrationSummary = {
      prisonId: history.filterPrisonId,
      activityStartDate: history.filterActivityStartDate,
      nomisActivityEndDate: history.filterNomisActivityEndDate,
      courseActivityId: history.filterCourseActivityId,
    }

    req.session.moveActivityStartDateForm = {
      migrationId,
      activityStartDate: history.filterActivityStartDate,
      newActivityStartDate: '',
    }
    await this.moveStartDate(req, res)
  }

  async moveStartDate(req: Request, res: Response): Promise<void> {
    res.render('pages/activities/moveActivityStartDate', {
      summary: req.session.activityMigrationSummary,
      form: req.session.moveActivityStartDateForm,
      errors: req.flash('errors'),
    })
  }

  async postMoveStartDate(req: Request, res: Response): Promise<void> {
    req.session.moveActivityStartDateForm = { ...trimForm(req.body) }

    const validationErrors = moveActivityStartDateValidator(req.session.moveActivityStartDateForm)
    if (validationErrors.length > 0) {
      req.flash('errors', validationErrors)
      res.redirect('/activities-migration/move-start-date/amend')
      return
    }

    try {
      const warnings = await this.activitiesNomisMigrationService.moveStartDate(
        context(res),
        req.session.moveActivityStartDateForm.migrationId,
        req.session.moveActivityStartDateForm.newActivityStartDate,
      )
      if (warnings.length > 0) {
        warnings.unshift('Move date succeeded but with the following warnings from DPS:')
        req.flash(
          'warnings',
          warnings.map(warning => ({ href: '', text: warning })),
        )
      }
      res.redirect('/activities-migration')
    } catch (error) {
      req.flash('errors', [{ href: '', text: `${error.message}: ${error.data.message}` }])
      res.redirect('/activities-migration/move-start-date/amend')
    }
  }

  private static toFilter(form: StartActivitiesMigrationForm): ActivitiesMigrationFilter {
    return {
      prisonId: form.prisonId,
      activityStartDate: form.activityStartDate,
      courseActivityId: form.courseActivityId,
    }
  }

  private static fullMigrationAppInsightsQuery(migrationId: string, startedDate: string, endedDate?: string): string {
    const startDateQuery = `datetime(${this.toISODateTime(startedDate)})`
    const endDateQuery = endedDate ? `datetime(${this.toISODateTime(endedDate)})` : `now()`
    return `customEvents
      | where cloud_RoleName == 'hmpps-prisoner-from-nomis-migration'
      | where timestamp between (${startDateQuery} .. ${endDateQuery})
      | where customDimensions.migrationId startswith '${migrationId}'
      | where name startswith 'activity-migration'
    `.trim()
  }

  private static activityIgnoredAppInsightsQuery(migrationId: string, startedDate: string, endedDate?: string): string {
    return `${this.fullMigrationAppInsightsQuery(migrationId, startedDate, endedDate)}
      | where name endswith 'ignored'
      | join kind=leftouter (
        traces
        | where timestamp between (datetime(${ActivitiesMigrationController.toISODateTime(
          startedDate,
        )}) .. datetime(${ActivitiesMigrationController.toISODateTime(endedDate)}))
        | where message startswith "Will not migrate"
      ) on $left.operation_Id==$right.operation_Id
      | project timestamp, name, message, migrationId=customDimensions.migrationId, crs_acty_id=customDimensions.nomisCourseActivityId, reason=customDimensions.reason, operation_Id
    `
  }

  private static failedMigrationAppInsightsQuery(migrationId: string, startedDate: string, endedDate?: string): string {
    return `${this.fullMigrationAppInsightsQuery(migrationId, startedDate, endedDate)}
      | where (name endswith 'failed' or name endswith 'error')
      | join kind=leftouter (
        traces
        | where timestamp between (datetime(${ActivitiesMigrationController.toISODateTime(
          startedDate,
        )}) .. datetime(${ActivitiesMigrationController.toISODateTime(endedDate)}))
        | where operation_Name == 'POST /migrate/activity' and (message startswith "Validation exception:" or message startswith "Exception:")
      ) on $left.operation_Id==$right.operation_Id
      | project timestamp, name, message, migrationId=customDimensions.migrationId, crs_acty_id=customDimensions.nomisCourseActivityId, reason=customDimensions.reason, operation_Id
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
    filterActivityStartDate?: string
    filterNomisActivityEndDate?: string
    filterCourseActivityId?: number
  } {
    const filter: Filter = JSON.parse(migration.filter)
    const filterPrisonId = filter.prisonId
    const filterActivityStartDate = filter.activityStartDate
    const filterNomisActivityEndDate = filter.nomisActivityEndDate
    const filterCourseActivityId = filter.courseActivityId
    const filterEndDate = (() => {
      if (filterNomisActivityEndDate) {
        return moment(filterNomisActivityEndDate)
      }
      if (filterActivityStartDate) {
        return moment(filterActivityStartDate)
      }
      return moment()
    })().format('YYYY-MM-DD')
    return {
      ...migration,
      ...(filterPrisonId && { filterPrisonId }),
      ...(filterActivityStartDate && { filterActivityStartDate }),
      ...(filterNomisActivityEndDate && { filterNomisActivityEndDate }),
      ...(filterCourseActivityId && { filterCourseActivityId }),
      ...(filterEndDate && { filterEndDate }),
    }
  }
}
