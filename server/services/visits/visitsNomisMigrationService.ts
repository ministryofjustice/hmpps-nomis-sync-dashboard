import querystring from 'querystring'
import {
  MigrationContextVisitsMigrationFilter,
  RoomMappingsResponse,
  VisitsMigrationFilter,
} from '../../@types/migration'

import RestClient from '../../data/restClient'
import config from '../../config'
import logger from '../../../logger'
import { GetVisitsByFilter } from '../../@types/nomisPrisoner'

export interface Context {
  username?: string
  token?: string
}

export default class VisitsNomisMigrationService {
  constructor() {}

  private static restClient(token: string): RestClient {
    return new RestClient('Visits Nomis MigrationHistory API Client', config.apis.nomisMigration, token)
  }

  async startVisitsMigration(
    filter: VisitsMigrationFilter,
    context: Context,
  ): Promise<MigrationContextVisitsMigrationFilter> {
    logger.info(`starting a visits migration`)
    return VisitsNomisMigrationService.restClient(context.token).post<MigrationContextVisitsMigrationFilter>({
      path: `/migrate/visits`,
      data: filter,
    })
  }

  async getVisitMigrationRoomMappings(filter: GetVisitsByFilter, context: Context): Promise<RoomMappingsResponse[]> {
    logger.info(`getting details for visit migration - room mappings`)
    return VisitsNomisMigrationService.restClient(context.token).get<RoomMappingsResponse[]>({
      path: `/migrate/visits/rooms/usage`,
      query: `${querystring.stringify({ ...filter, size: 1 })}`,
    })
  }
}
