import { Context } from './context'
import { CreateRoomMappingDto, RoomMappingResponse } from '../@types/mapping'
import MappingClient from '../data/mappingClient'

export default class MappingService {
  constructor(private readonly mappingClient: MappingClient) {}

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
