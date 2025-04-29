import RestClient from '../data/restClient'
import config from '../config'
import { Context } from './nomisMigrationService'
import { CreateRoomMappingDto, RoomMappingResponse } from '../@types/mapping'
import MappingClient from '../data/mappingClient'

export default class MappingService {
  constructor(private readonly mappingClient: MappingClient) {}

  private static restClient(token: string): RestClient {
    return new RestClient('Mapping API Client', config.apis.mapping, token)
  }

  async getVisitRoomMappings(prisonId: string, context: Context): Promise<RoomMappingResponse[]> {
    return this.mappingClient.getVisitRoomMappings(prisonId, context)
  }

  async deleteVisitRoomMappings(prisonId: string, nomisRoomDescription: string, context: Context): Promise<void> {
    return this.mappingClient.deleteVisitRoomMappings(prisonId, nomisRoomDescription, context)
  }

  async addVisitRoomMappings(prisonId: string, mapping: CreateRoomMappingDto, context: Context): Promise<void> {
    return this.mappingClient.addVisitRoomMappings(prisonId, mapping, context)
  }
}
