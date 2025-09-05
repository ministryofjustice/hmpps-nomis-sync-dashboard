import { MigrationContextMovementsMigrationFilter, MovementsMigrationFilter } from '../../@types/migration'

import { Context } from '../context'
import MovementsNomisMigrationClient from '../../data/movementsNomisMigrationClient'

export default class MovementsNomisMigrationService {
  constructor(private readonly movementsNomisMigrationClient: MovementsNomisMigrationClient) {}

  async startMigration(
    filter: MovementsMigrationFilter,
    context: Context,
  ): Promise<MigrationContextMovementsMigrationFilter> {
    return this.movementsNomisMigrationClient.startMigration(filter, context)
  }
}
