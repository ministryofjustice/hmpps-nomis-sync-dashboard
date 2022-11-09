import RestClient from '../data/restClient'
import config from '../config'
import logger from '../../logger'
import { Context } from './nomisMigrationService'
import type HmppsAuthClient from '../data/hmppsAuthClient'
import { RoomMappingResponse } from '../@types/mapping'

export default class MappingService {
  constructor(private readonly hmppsAuthClient: HmppsAuthClient) {}

  private static restClient(token: string): RestClient {
    return new RestClient('Mapping API Client', config.apis.mapping, token)
  }

  async getVisitRoomMappings(prisonId: string, context: Context): Promise<RoomMappingResponse[]> {
    const token = await this.hmppsAuthClient.getSystemClientToken(context.username)
    logger.info(`getting room mappings for ${prisonId}`)
    return MappingService.restClient(token).get<RoomMappingResponse[]>({
      path: `/prison/${prisonId}/room-mappings`,
    })
  }

  async deleteVisitRoomMappings(prisonId: string, nomisRoomDescription: string, context: Context): Promise<void> {
    const token = await this.hmppsAuthClient.getSystemClientToken(context.username)
    logger.info(`delete room mapping for ${prisonId} with nomis room description ${nomisRoomDescription}`)
    return MappingService.restClient(token).delete<void>({
      path: `/prison/${prisonId}/room-mappings/nomis-room-id/${nomisRoomDescription}`,
    })
  }
}
