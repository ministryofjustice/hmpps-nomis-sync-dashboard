import { asSystem, RestClient } from '@ministryofjustice/hmpps-rest-client'
import { AuthenticationClient } from '@ministryofjustice/hmpps-auth-clients'
import config from '../config'
import logger from '../../logger'
import { CreateRoomMappingDto, RoomMappingResponse } from '../@types/mapping'
import { Context } from '../services/nomisMigrationService'

export default class MappingClient extends RestClient {
  constructor(authenticationClient: AuthenticationClient) {
    super('Mapping API Client', config.apis.mapping, logger, authenticationClient)
  }

  async getVisitRoomMappings(prisonId: string, context: Context): Promise<RoomMappingResponse[]> {
    logger.info(`getting room mappings for ${prisonId}`)
    return this.get<RoomMappingResponse[]>(
      {
        path: `/prison/${prisonId}/room-mappings`,
      },
      asSystem(context.username),
    )
  }

  async deleteVisitRoomMappings(prisonId: string, nomisRoomDescription: string, context: Context): Promise<void> {
    logger.info(`delete room mapping for ${prisonId} with nomis room description ${nomisRoomDescription}`)
    const encodedRoom = encodeURIComponent(nomisRoomDescription)
    return this.delete<void>(
      {
        path: `/prison/${prisonId}/room-mappings/nomis-room-id/${encodedRoom}`,
      },
      asSystem(context.username),
    )
  }

  async addVisitRoomMappings(prisonId: string, mapping: CreateRoomMappingDto, context: Context): Promise<void> {
    logger.info(`add room mapping for ${prisonId}, ${mapping}`)
    return this.post<void>(
      {
        path: `/prison/${prisonId}/room-mappings`,
        data: mapping,
      },
      asSystem(context.username),
    )
  }
}
