import querystring from 'querystring'
import { AuthenticationClient } from '@ministryofjustice/hmpps-auth-clients'
import { asSystem, RestClient } from '@ministryofjustice/hmpps-rest-client'

import {
  GetVisitsByFilter,
  GetAdjustmentsByFilter,
  PageAdjustmentIdResponse,
  PageVisitIdResponse,
  VisitRoomCountResponse,
  PagePrisonerId,
  GetCourtCaseIdsByFilter,
  IncentiveLevel,
  FindAllocationsMissingPayBandsResponse,
  GetActivitiesByFilter,
  GetAllocationsByFilter,
  PageActivitiesIdResponse,
  PageAllocationsIdResponse,
  FindPayRateWithUnknownIncentiveResponse,
  FindActivitiesWithoutScheduleRulesResponse,
  AppointmentCountsResponse,
  PageIncidentIdResponse,
  GetIncidentIdsByFilter,
} from '../@types/nomisPrisoner'
import logger from '../../logger'
import type { ActivitiesMigrationFilter, AppointmentsMigrationFilter } from '../@types/migration'
import type { FindSuspendedAllocationsResponse } from '../@types/nomisPrisoner'
import { Context } from '../services/nomisMigrationService'
import config from '../config'

export default class NomisPrisonerClient extends RestClient {
  constructor(authenticationClient: AuthenticationClient) {
    super('Nomis Prisoner API Client', config.apis.nomisPrisoner, logger, authenticationClient)
  }

  async getVisitMigrationEstimatedCount(filter: GetVisitsByFilter, context: Context): Promise<number> {
    logger.info(`getting details for visit migration  estimated count`)
    const response = await this.get<PageVisitIdResponse>(
      {
        path: `/visits/ids`,
        query: `${querystring.stringify({ ...filter, size: 1 })}`,
      },
      asSystem(context.username),
    )
    return response.totalElements
  }

  // TODO currently only dealing with adjustments, to be expanded with other sentencing entities
  async getSentencingMigrationEstimatedCount(filter: GetAdjustmentsByFilter, context: Context): Promise<number> {
    logger.info(`getting details for sentencing migration estimated count`)
    const response = await this.get<PageAdjustmentIdResponse>(
      {
        path: `/adjustments/ids`,
        query: `${querystring.stringify({ ...filter, size: 1 })}`,
      },
      asSystem(context.username),
    )
    return response.totalElements
  }

  async getAppointmentsMigrationEstimatedCount(filter: GetAdjustmentsByFilter, context: Context): Promise<number> {
    logger.info(`getting details for appointments migration estimated count`)
    const response = await this.get<PageAdjustmentIdResponse>(
      {
        path: `/appointments/ids`,
        query: `${querystring.stringify({ ...filter, size: 1 })}`,
      },
      asSystem(context.username),
    )
    return response.totalElements
  }

  async getCourtSentencingMigrationEstimatedCount(filter: GetCourtCaseIdsByFilter, context: Context): Promise<number> {
    logger.info(`getting details for court sentencing migration estimated count`)
    const response = await this.get<PagePrisonerId>(
      {
        path: `/prisoners/ids/all`,
        query: `${querystring.stringify({ ...filter, size: 1 })}`,
      },
      asSystem(context.username),
    )
    return response.totalElements
  }

  async getCorePersonMigrationEstimatedCount(context: Context): Promise<number> {
    logger.info(`getting details for core person migration estimated count`)
    const response = await this.get<PagePrisonerId>(
      {
        path: `/prisoners/ids/all`,
        query: `${querystring.stringify({ size: 1 })}`,
      },
      asSystem(context.username),
    )
    return response.totalElements
  }

  async getIncidentsMigrationEstimatedCount(filter: GetIncidentIdsByFilter, context: Context): Promise<number> {
    logger.info(`getting details for incidents migration  estimated count`)
    const response = await this.get<PageIncidentIdResponse>(
      {
        path: `/incidents/ids`,
        query: `${querystring.stringify({ ...filter, size: 1 })}`,
      },
      asSystem(context.username),
    )
    return response.totalElements
  }

  async getVisitRooms(prisonId: string, futureVisits: boolean, context: Context): Promise<VisitRoomCountResponse[]> {
    return this.get<VisitRoomCountResponse[]>(
      {
        path: `/visits/rooms/usage-count?prisonIds=${prisonId}&visitTypes=SCON&futureVisitsOnly=${futureVisits}`,
      },
      asSystem(context.username),
    )
  }

  async getPrisonIncentiveLevels(prisonId: string, context: Context): Promise<IncentiveLevel[]> {
    return this.get<IncentiveLevel[]>(
      {
        path: `/prisons/${prisonId}/incentive-levels`,
      },
      asSystem(context.username),
    )
  }

  async checkServiceAgencySwitch(prisonId: string, serviceName: string, context: Context): Promise<boolean> {
    try {
      await this.get<void>(
        {
          path: `/service-prisons/${serviceName}/prison/${prisonId}`,
        },
        asSystem(context.username),
      )
    } catch (error) {
      if (error.responseStatus === 404) {
        return false
      }
      throw error
    }
    return true
  }

  async createServiceAgencySwitch(prisonId: string, serviceName: string, context: Context): Promise<void> {
    try {
      await this.post<void>(
        {
          path: `/service-prisons/${serviceName}/prison/${prisonId}`,
        },
        asSystem(context.username),
      )
    } catch (error) {
      logger.info(`Failed to turn on ${serviceName} service for ${prisonId} - error ${error}`)
    }
  }

  async getActivitiesMigrationEstimatedCount(filter: GetActivitiesByFilter, context: Context): Promise<number> {
    logger.info(`getting details for activities migration estimated count`)
    const response = await this.get<PageActivitiesIdResponse>(
      {
        path: `/activities/ids`,
        query: `${querystring.stringify({ ...filter, size: 1 })}`,
      },
      asSystem(context.username),
    )
    return response.totalElements
  }

  async getAllocationsMigrationEstimatedCount(filter: GetAllocationsByFilter, context: Context): Promise<number> {
    logger.info(`getting details for allocations migration estimated count`)
    const response = await this.get<PageAllocationsIdResponse>(
      {
        path: `/allocations/ids`,
        query: `${querystring.stringify({ ...filter, size: 1 })}`,
      },
      asSystem(context.username),
    )
    return response.totalElements
  }

  async findActivitiesSuspendedAllocations(
    filter: ActivitiesMigrationFilter,
    context: Context,
  ): Promise<FindSuspendedAllocationsResponse[]> {
    logger.info(`finding suspended allocations for activities migration`)
    const queryParams = {
      ...filter,
    }

    return this.get<FindSuspendedAllocationsResponse[]>(
      {
        path: `/allocations/suspended`,
        query: querystring.stringify(queryParams),
      },
      asSystem(context.username),
    )
  }

  async findAllocationsWithMissingPayBands(
    filter: ActivitiesMigrationFilter,
    context: Context,
  ): Promise<FindAllocationsMissingPayBandsResponse[]> {
    logger.info(`finding allocations with missing pay bands for activities migration`)
    const queryParams = {
      ...filter,
    }

    return this.get<FindAllocationsMissingPayBandsResponse[]>(
      {
        path: `/allocations/missing-pay-bands`,
        query: querystring.stringify(queryParams),
      },
      asSystem(context.username),
    )
  }

  async findPayRatesWithUnknownIncentive(
    filter: ActivitiesMigrationFilter,
    context: Context,
  ): Promise<FindPayRateWithUnknownIncentiveResponse[]> {
    logger.info(`finding activity pay rates with unknown incentives for activities migration`)
    const queryParams = {
      ...filter,
    }

    return this.get<FindPayRateWithUnknownIncentiveResponse[]>(
      {
        path: `/activities/rates-with-unknown-incentives`,
        query: querystring.stringify(queryParams),
      },
      asSystem(context.username),
    )
  }

  async findActivitiesWithoutScheduleRules(
    filter: ActivitiesMigrationFilter,
    context: Context,
  ): Promise<FindActivitiesWithoutScheduleRulesResponse[]> {
    logger.info(`finding activities without schedule rules for activities migration`)
    const queryParams = {
      ...filter,
    }

    return this.get<FindActivitiesWithoutScheduleRulesResponse[]>(
      {
        path: `/activities/without-schedule-rules`,
        query: querystring.stringify(queryParams),
      },
      asSystem(context.username),
    )
  }

  async findAppointmentCounts(
    filter: AppointmentsMigrationFilter,
    context: Context,
  ): Promise<AppointmentCountsResponse[]> {
    logger.info(`finding appointments summary counts for appointments migration`)
    return this.get<AppointmentCountsResponse[]>(
      {
        path: `/appointments/counts`,
        query: querystring.stringify({ ...filter }),
      },
      asSystem(context.username),
    )
  }
}
