import { ActivitiesMigrationFilter, MigrationContextActivitiesMigrationFilter } from '../../@types/migration'

import { Context } from '../context'
import ActivitiesNomisMigrationClient from '../../data/activitiesNomisMigrationClient'

export default class ActivitiesNomisMigrationService {
  constructor(private readonly activitiesNomisMigrationClient: ActivitiesNomisMigrationClient) {}

  async startActivitiesMigration(
    filter: ActivitiesMigrationFilter,
    context: Context,
  ): Promise<MigrationContextActivitiesMigrationFilter> {
    return this.activitiesNomisMigrationClient.startActivitiesMigration(filter, context)
  }

  async endMigratedActivities(context: Context, migrationId: string): Promise<string> {
    return this.activitiesNomisMigrationClient.endMigratedActivities(context, migrationId)
  }
}
