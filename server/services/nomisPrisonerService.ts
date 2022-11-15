import querystring from 'querystring'
import RestClient from '../data/restClient'
import config from '../config'
import {
  GetIncentivesByFilter,
  GetVisitsByFilter,
  PageIncentiveIdResponse,
  PageVisitIdResponse,
  VisitRoomCountResponse,
} from '../@types/nomisPrisoner'
import logger from '../../logger'
import { Context } from './nomisMigrationService'
import type HmppsAuthClient from '../data/hmppsAuthClient'

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

  async getIncentiveMigrationEstimatedCount(filter: GetIncentivesByFilter, context: Context): Promise<number> {
    const token = await this.hmppsAuthClient.getSystemClientToken(context.username)
    logger.info(`getting details for incentive migration  estimated count`)
    const response = await NomisPrisonerService.restClient(token).get<PageIncentiveIdResponse>({
      path: `/incentives/ids`,
      query: `${querystring.stringify({ ...filter, size: 1 })}`,
    })
    return response.totalElements
  }

  async getVisitRooms(prisonId: string, futureVisits: boolean, context: Context): Promise<VisitRoomCountResponse[]> {
    const token = await this.hmppsAuthClient.getSystemClientToken(context.username)
    return NomisPrisonerService.restClient(token).get<VisitRoomCountResponse[]>({
      path: `/visits/rooms/usage-count?prisonIds=${prisonId}&futureVisitsOnly=${futureVisits}`,
    })
  }
}
