import {
  GetVisitsByFilter,
  GetAdjustmentsByFilter,
  VisitRoomCountResponse,
  GetCourtCaseIdsByFilter,
  IncentiveLevel,
  FindAllocationsMissingPayBandsResponse,
  GetActivitiesByFilter,
  GetAllocationsByFilter,
  FindPayRateWithUnknownIncentiveResponse,
  FindActivitiesWithoutScheduleRulesResponse,
  AppointmentCountsResponse,
  GetIncidentIdsByFilter,
} from '../@types/nomisPrisoner'
import { Context } from './nomisMigrationService'
import type { ActivitiesMigrationFilter, AppointmentsMigrationFilter } from '../@types/migration'
import type { FindSuspendedAllocationsResponse } from '../@types/nomisPrisoner'
import NomisPrisonerClient from '../data/nomisPrisonerClient'

export default class NomisPrisonerService {
  constructor(private readonly nomisPrisonerClient: NomisPrisonerClient) {}

  async getVisitMigrationEstimatedCount(filter: GetVisitsByFilter, context: Context): Promise<number> {
    return this.nomisPrisonerClient.getVisitMigrationEstimatedCount(filter, context)
  }

  // TODO currently only dealing with adjustments, to be expanded with other sentencing entities
  async getSentencingMigrationEstimatedCount(filter: GetAdjustmentsByFilter, context: Context): Promise<number> {
    return this.nomisPrisonerClient.getSentencingMigrationEstimatedCount(filter, context)
  }

  async getAppointmentsMigrationEstimatedCount(filter: GetAdjustmentsByFilter, context: Context): Promise<number> {
    return this.nomisPrisonerClient.getAppointmentsMigrationEstimatedCount(filter, context)
  }

  async getCourtSentencingMigrationEstimatedCount(filter: GetCourtCaseIdsByFilter, context: Context): Promise<number> {
    return this.nomisPrisonerClient.getCourtSentencingMigrationEstimatedCount(filter, context)
  }

  async getCorePersonMigrationEstimatedCount(context: Context): Promise<number> {
    return this.nomisPrisonerClient.getCorePersonMigrationEstimatedCount(context)
  }

  async getIncidentsMigrationEstimatedCount(filter: GetIncidentIdsByFilter, context: Context): Promise<number> {
    return this.nomisPrisonerClient.getIncidentsMigrationEstimatedCount(filter, context)
  }

  async getVisitRooms(prisonId: string, futureVisits: boolean, context: Context): Promise<VisitRoomCountResponse[]> {
    return this.nomisPrisonerClient.getVisitRooms(prisonId, futureVisits, context)
  }

  async getPrisonIncentiveLevels(prisonId: string, context: Context): Promise<IncentiveLevel[]> {
    return this.nomisPrisonerClient.getPrisonIncentiveLevels(prisonId, context)
  }

  async checkServiceAgencySwitch(prisonId: string, serviceName: string, context: Context): Promise<boolean> {
    return this.nomisPrisonerClient.checkServiceAgencySwitch(prisonId, serviceName, context)
  }

  async createServiceAgencySwitch(prisonId: string, serviceName: string, context: Context): Promise<void> {
    return this.nomisPrisonerClient.createServiceAgencySwitch(prisonId, serviceName, context)
  }

  async getActivitiesMigrationEstimatedCount(filter: GetActivitiesByFilter, context: Context): Promise<number> {
    return this.nomisPrisonerClient.getActivitiesMigrationEstimatedCount(filter, context)
  }

  async getAllocationsMigrationEstimatedCount(filter: GetAllocationsByFilter, context: Context): Promise<number> {
    return this.nomisPrisonerClient.getAllocationsMigrationEstimatedCount(filter, context)
  }

  async findActivitiesSuspendedAllocations(
    filter: ActivitiesMigrationFilter,
    context: Context,
  ): Promise<FindSuspendedAllocationsResponse[]> {
    return this.nomisPrisonerClient.findActivitiesSuspendedAllocations(filter, context)
  }

  async findAllocationsWithMissingPayBands(
    filter: ActivitiesMigrationFilter,
    context: Context,
  ): Promise<FindAllocationsMissingPayBandsResponse[]> {
    return this.nomisPrisonerClient.findAllocationsWithMissingPayBands(filter, context)
  }

  async findPayRatesWithUnknownIncentive(
    filter: ActivitiesMigrationFilter,
    context: Context,
  ): Promise<FindPayRateWithUnknownIncentiveResponse[]> {
    return this.nomisPrisonerClient.findPayRatesWithUnknownIncentive(filter, context)
  }

  async findActivitiesWithoutScheduleRules(
    filter: ActivitiesMigrationFilter,
    context: Context,
  ): Promise<FindActivitiesWithoutScheduleRulesResponse[]> {
    return this.nomisPrisonerClient.findActivitiesWithoutScheduleRules(filter, context)
  }

  async findAppointmentCounts(
    filter: AppointmentsMigrationFilter,
    context: Context,
  ): Promise<AppointmentCountsResponse[]> {
    return this.nomisPrisonerClient.findAppointmentCounts(filter, context)
  }
}
