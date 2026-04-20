import { MigrationContextMovementsMigrationFilter, MovementsMigrationFilter } from '../../@types/migration'

import { Context } from '../context'
import TapsNomisMigrationClient from '../../data/tapsNomisMigrationClient'

export default class TapsNomisMigrationService {
  constructor(private readonly tapsNomisMigrationClient: TapsNomisMigrationClient) {}

  async startMigration(
    filter: MovementsMigrationFilter,
    context: Context,
  ): Promise<MigrationContextMovementsMigrationFilter> {
    return this.tapsNomisMigrationClient.startMigration(filter, context)
  }
}
