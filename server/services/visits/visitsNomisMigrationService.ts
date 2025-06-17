import {
  MigrationContextVisitsMigrationFilter,
  RoomMappingsResponse,
  VisitsMigrationFilter,
} from '../../@types/migration'

import { GetVisitsByFilter } from '../../@types/nomisPrisoner'
import VisitsNomisMigrationClient from '../../data/visitsNomisMigrationClient'
import { Context } from '../context'

export default class VisitsNomisMigrationService {
  constructor(private readonly visitsNomisMigrationClient: VisitsNomisMigrationClient) {}

  async startVisitsMigration(
    filter: VisitsMigrationFilter,
    context: Context,
  ): Promise<MigrationContextVisitsMigrationFilter> {
    return this.visitsNomisMigrationClient.startVisitsMigration(filter, context)
  }

  async getVisitMigrationRoomMappings(filter: GetVisitsByFilter, context: Context): Promise<RoomMappingsResponse[]> {
    return this.visitsNomisMigrationClient.getVisitMigrationRoomMappings(filter, context)
  }
}
