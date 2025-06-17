import { MigrationContextCorePersonMigrationFilter } from '../../@types/migration'

import { Context } from '../context'
import CorePersonNomisMigrationClient from '../../data/corePersonNomisMigrationClient'

export default class CorePersonNomisMigrationService {
  constructor(private readonly corePersonNomisMigrationClient: CorePersonNomisMigrationClient) {}

  async startMigration(context: Context): Promise<MigrationContextCorePersonMigrationFilter> {
    return this.corePersonNomisMigrationClient.startMigration(context)
  }
}
