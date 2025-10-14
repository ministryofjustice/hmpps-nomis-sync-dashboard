import { asSystem, RestClient } from '@ministryofjustice/hmpps-rest-client'
import { AuthenticationClient } from '@ministryofjustice/hmpps-auth-clients'
import config from '../config'
import logger from '../../logger'
import { Context } from '../services/context'
import { MigrationContextVisitsMigrationFilter, RoomMappingsResponse, VisitsMigrationFilter } from '../@types/migration'
import { GetVisitsByFilter } from '../@types/nomisPrisoner'

export default class VisitsNomisMigrationClient extends RestClient {
  constructor(authenticationClient: AuthenticationClient) {
    super('Visits Nomis MigrationHistory API Client', config.apis.nomisMigration, logger, authenticationClient)
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
      asSystem(context.username),
    )
  }

  async getVisitMigrationRoomMappings(filter: GetVisitsByFilter, context: Context): Promise<RoomMappingsResponse[]> {
    logger.info(`getting details for visit migration - room mappings`)
    return this.get<RoomMappingsResponse[]>(
      {
        path: `/migrate/visits/rooms/usage`,
        query: { ...filter, size: 1 },
      },
      asSystem(context.username),
    )
  }
}
