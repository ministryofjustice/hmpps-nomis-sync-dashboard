import { IncidentsMigrationFilter, MigrationContextIncidentsMigrationFilter } from '../../@types/migration'

import { Context } from '../context'
import IncidentsNomisMigrationClient from '../../data/incidentsNomisMigrationClient'

export default class IncidentsNomisMigrationService {
  constructor(private readonly incidentsNomisMigrationClient: IncidentsNomisMigrationClient) {}

  async startIncidentsMigration(
    filter: IncidentsMigrationFilter,
    context: Context,
  ): Promise<MigrationContextIncidentsMigrationFilter> {
    return this.incidentsNomisMigrationClient.startIncidentsMigration(filter, context)
  }
}
