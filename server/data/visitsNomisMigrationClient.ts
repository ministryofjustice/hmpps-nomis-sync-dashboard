import querystring from 'querystring'
import { asUser, RestClient } from '@ministryofjustice/hmpps-rest-client'
import config from '../config'
import logger from '../../logger'
import { Context } from '../services/nomisMigrationService'
import { MigrationContextVisitsMigrationFilter, RoomMappingsResponse, VisitsMigrationFilter } from '../@types/migration'
import { GetVisitsByFilter } from '../@types/nomisPrisoner'

export default class VisitsNomisMigrationClient extends RestClient {
  constructor() {
    super('Visits Nomis MigrationHistory API Client', config.apis.nomisMigration, logger)
  }

  async startVisitsMigration(
    filter: VisitsMigrationFilter,
    context: Context,
  ): Promise<MigrationContextVisitsMigrationFilter> {
    logger.info(`starting a visits migration`)
    return this.post<MigrationContextVisitsMigrationFilter>(
      {
        path: `/migrate/visits`,
        data: filter,
      },
      asUser(context.token),
    )
  }

  async getVisitMigrationRoomMappings(filter: GetVisitsByFilter, context: Context): Promise<RoomMappingsResponse[]> {
    logger.info(`getting details for visit migration - room mappings`)
    return this.get<RoomMappingsResponse[]>(
      {
        path: `/migrate/visits/rooms/usage`,
        query: `${querystring.stringify({ ...filter, size: 1 })}`,
      },
      asUser(context.token),
    )
  }
}
