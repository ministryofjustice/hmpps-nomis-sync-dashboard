import { Request, Response } from 'express'
import { StartActivitiesMigrationForm } from 'express-session'
import moment from 'moment'
import NomisMigrationService, { Context } from '../../services/nomisMigrationService'
import { ActivitiesMigrationFilter, MigrationHistory } from '../../@types/migration'
import buildUrl from '../../utils/applicationInsightsUrlBuilder'
import trimForm from '../../utils/trim'
import logger from '../../../logger'
import startActivitiesMigrationValidator from './startActivitiesMigrationValidator'
import NomisPrisonerService from '../../services/nomisPrisonerService'
import {
  FindAllocationsMissingPayBandsResponse,
  FindPayRateWithUnknownIncentiveResponse,
  FindSuspendedAllocationsResponse,
  IncentiveLevel,
} from '../../@types/nomisPrisoner'
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

export default class ActivitiesMigrationController {
  constructor(
    private readonly nomisMigrationService: NomisMigrationService,
    private readonly nomisPrisonerService: NomisPrisonerService,
    private readonly activitiesService: ActivitiesService,
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
      endMigratedActivitiesResult: req.session.endMigratedActivitiesResult,
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
    const activityCategoriesPromise = this.activitiesService.getActivityCategories(context(res))
    await Promise.all([
      this.nomisPrisonerService
        .getActivitiesMigrationEstimatedCount(filter, await activityCategoriesPromise, context(res))
        .catch(error => {
          errors.push({ text: `Failed to get count due to error: ${error.data.userMessage}`, href: '' })
          return 0
        }),

      this.nomisMigrationService.getActivitiesDLQMessageCount(context(res)).catch(error => {
        errors.push({
          text: `Failed to get DLQ count due to error: ${error.data?.message || error.message}`,
          href: '',
        })
        return 0
      }),

      this.nomisPrisonerService.getPrisonIncentiveLevels(prisonId, context(res)).catch(error => {
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

      this.activitiesService.getRolloutPrison(prisonId, context(res)).catch(error => {
        errors.push({
          text: `Failed to check if prison ${prisonId} is switched on in DPS due to error: ${error.message}`,
          href: '',
        })
        return null
      }),

      this.activitiesService.checkPrisonPayBandsExist(prisonId, context(res)).catch(error => {
        errors.push({
          text: `Failed to check if prison ${prisonId} has pay bands in DPS due to error: ${error.message}`,
          href: '',
        })
        return null
      }),

      this.activitiesService.checkPrisonRegimeExists(prisonId, context(res)).catch(error => {
        errors.push({
          text: `Failed to check if prison ${prisonId} has slot times configured in DPS due to error: ${error.message}`,
          href: '',
        })
        return null
      }),

      this.nomisPrisonerService
        .findActivitiesSuspendedAllocations(filter, await activityCategoriesPromise, context(res))
        .catch(error => {
          errors.push({
            text: `Failed to find suspended allocations due to error: ${error.message}`,
            href: '',
          })
          return []
        }),

      this.nomisPrisonerService
        .findAllocationsWithMissingPayBands(filter, await activityCategoriesPromise, context(res))
        .catch(error => {
          errors.push({
            text: `Failed to find allocations with missing pay bands due to error: ${error.message}`,
            href: '',
          })
          return []
        }),

      this.nomisPrisonerService
        .findPayRatesWithUnknownIncentive(filter, await activityCategoriesPromise, context(res))
        .catch(error => {
          errors.push({
            text: `Failed to find pay rates with unknown incentive due to error: ${error.message}`,
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
      ]) => {
        req.session.startActivitiesMigrationForm.estimatedCount = estimatedCount.toLocaleString()
        req.session.startActivitiesMigrationForm.dlqCount = dlqCount.toLocaleString()
        req.session.startActivitiesMigrationForm.incentiveLevelIds = incentiveLevels.map(
          (level: IncentiveLevel) => level.code,
        )
        req.session.startActivitiesMigrationForm.prisonSwitchedOnNomis = nomisFeatureSwitchOn
        req.session.startActivitiesMigrationForm.prisonSwitchedOnDps =
          dpsPrisonRollout === null ||
          (dpsPrisonRollout.activitiesRolledOut &&
            (!dpsPrisonRollout.activitiesRolloutDate ||
              dpsPrisonRollout.activitiesRolloutDate <= moment().format('YYYY-MM-DD')))
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

  async startActivitiesMigrationPreview(req: Request, res: Response): Promise<void> {
    res.render('pages/activities/startActivitiesMigrationPreview', {
      form: req.session.startActivitiesMigrationForm,
      errors: req.flash('errors'),
    })
  }

  async postClearDLQActivitiesMigrationPreview(req: Request, res: Response): Promise<void> {
    const result = await this.nomisMigrationService.deleteActivitiesFailures(context(res))
    logger.info(`${result.messagesFoundCount} failures deleted`)
    req.body = { ...req.session.startActivitiesMigrationForm }
    await this.postStartActivitiesMigration(req, res)
  }

  async postEndMigratedActivities(req: Request, res: Response): Promise<void> {
    const { migrationId } = req.query as { migrationId: string }
    const result = await this.nomisMigrationService.endMigratedActivities(context(res), migrationId)
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
    | where message startswith 'Will not migrate the courseActivityId'
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
