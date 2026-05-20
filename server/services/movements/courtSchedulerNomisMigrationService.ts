import { MigrationContextMovementsMigrationFilter, MovementsMigrationFilter } from '../../@types/migration'

import { Context } from '../context'
import CourtSchedulerNomisMigrationClient from '../../data/courtSchedulerNomisMigrationClient'

export default class CourtSchedulerNomisMigrationService {
  constructor(private readonly courtSchedulerNomisMigrationClient: CourtSchedulerNomisMigrationClient) {}

  async startMigration(
    filter: MovementsMigrationFilter,
    context: Context,
  ): Promise<MigrationContextMovementsMigrationFilter> {
    return this.courtSchedulerNomisMigrationClient.startMigration(filter, context)
  }
}
