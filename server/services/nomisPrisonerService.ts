import querystring from 'querystring'
import RestClient from '../data/restClient'
import config from '../config'
import {
  GetVisitsByFilter,
  GetAdjustmentsByFilter,
  PageAdjustmentIdResponse,
  PageVisitIdResponse,
  VisitRoomCountResponse,
  PageAdjudicationIdResponse,
  GetAdjudicationChargeIdsByFilter,
  IncentiveLevel,
} from '../@types/nomisPrisoner'
import logger from '../../logger'
import { Context } from './nomisMigrationService'
import type HmppsAuthClient from '../data/hmppsAuthClient'
import type { ActivitiesMigrationFilter } from '../@types/migration'
import type { FindSuspendedAllocationsResponse } from '../@types/nomisPrisoner'

export default class NomisPrisonerService {
  constructor(private readonly hmppsAuthClient: HmppsAuthClient) {}

  private static restClient(token: string): RestClient {
    return new RestClient('Nomis Prisoner API Client', config.apis.nomisPrisoner, token)
  }

  async getVisitMigrationEstimatedCount(filter: GetVisitsByFilter, context: Context): Promise<number> {
    const token = await this.hmppsAuthClient.getSystemClientToken(context.username)
    logger.info(`getting details for visit migration  estimated count`)
    const response = await NomisPrisonerService.restClient(token).get<PageVisitIdResponse>({
      path: `/visits/ids`,
      query: `${querystring.stringify({ ...filter, size: 1 })}`,
    })
    return response.totalElements
  }

  // TODO currently only dealing with adjustments, to be expanded with other sentencing entities
  async getSentencingMigrationEstimatedCount(filter: GetAdjustmentsByFilter, context: Context): Promise<number> {
    const token = await this.hmppsAuthClient.getSystemClientToken(context.username)
    logger.info(`getting details for sentencing migration estimated count`)
    const response = await NomisPrisonerService.restClient(token).get<PageAdjustmentIdResponse>({
      path: `/adjustments/ids`,
      query: `${querystring.stringify({ ...filter, size: 1 })}`,
    })
    return response.totalElements
  }

  async getAppointmentsMigrationEstimatedCount(filter: GetAdjustmentsByFilter, context: Context): Promise<number> {
    const token = await this.hmppsAuthClient.getSystemClientToken(context.username)
    logger.info(`getting details for appointments migration estimated count`)
    const response = await NomisPrisonerService.restClient(token).get<PageAdjustmentIdResponse>({
      path: `/appointments/ids`,
      query: `${querystring.stringify({ ...filter, size: 1 })}`,
    })
    return response.totalElements
  }

  async getAdjudicationsMigrationEstimatedCount(
    filter: GetAdjudicationChargeIdsByFilter,
    context: Context,
  ): Promise<number> {
    const token = await this.hmppsAuthClient.getSystemClientToken(context.username)
    logger.info(`getting details for adjudications migration estimated count`)
    const response = await NomisPrisonerService.restClient(token).get<PageAdjudicationIdResponse>({
      path: `/adjudications/charges/ids`,
      query: `${querystring.stringify({ ...filter, size: 1 })}`,
    })
    return response.totalElements
  }

  async getVisitRooms(prisonId: string, futureVisits: boolean, context: Context): Promise<VisitRoomCountResponse[]> {
    const token = await this.hmppsAuthClient.getSystemClientToken(context.username)
    return NomisPrisonerService.restClient(token).get<VisitRoomCountResponse[]>({
      path: `/visits/rooms/usage-count?prisonIds=${prisonId}&visitTypes=SCON&futureVisitsOnly=${futureVisits}`,
    })
  }

  async getPrisonIncentiveLevels(prisonId: string, context: Context): Promise<IncentiveLevel[]> {
    const token = await this.hmppsAuthClient.getSystemClientToken(context.username)
    return NomisPrisonerService.restClient(token).get<IncentiveLevel[]>({
      path: `/prisons/${prisonId}/incentive-levels`,
    })
  }

  async checkServiceAgencySwitch(prisonId: string, serviceName: string, context: Context): Promise<boolean> {
    const token = await this.hmppsAuthClient.getSystemClientToken(context.username)
    try {
      await NomisPrisonerService.restClient(token).get<void>({
        path: `/service-prisons/${serviceName}/prison/${prisonId}`,
      })
    } catch (error) {
      if (error.status === 404) {
        return false
      }
      throw error
    }
    return true
  }

  async createServiceAgencySwitch(prisonId: string, serviceName: string, context: Context): Promise<void> {
    const token = await this.hmppsAuthClient.getSystemClientToken(context.username)
    try {
      await NomisPrisonerService.restClient(token).post<void>({
        path: `/service-prisons/${serviceName}/prison/${prisonId}`,
      })
    } catch (error) {
      logger.info(`Failed to turn on ${serviceName} service for ${prisonId}`)
    }
  }

  async findActivitiesSuspendedAllocations(
    filter: ActivitiesMigrationFilter,
    activityCategories: string[],
    context: Context,
  ): Promise<FindSuspendedAllocationsResponse[]> {
    logger.info(`finding suspended allocations for activities migration`)
    const queryParams = {
      ...filter,
      excludeProgramCodes: activityCategories,
    }

    return NomisPrisonerService.restClient(context.token).get<FindSuspendedAllocationsResponse[]>({
      path: `/allocations/suspended`,
      query: querystring.stringify(queryParams),
    })
  }
}
