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
}
