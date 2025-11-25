import { MigrationContextOfficialVisitsMigrationFilter, OfficialVisitsMigrationFilter } from '../../@types/migration'

import { Context } from '../context'
import OfficialvisitsNomisMigrationClient from '../../data/officialvisitsNomisMigrationClient'

export default class OfficialvisitsNomisMigrationService {
  constructor(private readonly officialvisitsNomisMigrationClient: OfficialvisitsNomisMigrationClient) {}

  async startMigration(
    filter: OfficialVisitsMigrationFilter,
    context: Context,
  ): Promise<MigrationContextOfficialVisitsMigrationFilter> {
    return this.officialvisitsNomisMigrationClient.startMigration(filter, context)
  }
}
