import { MigrationContextPrisonBalanceMigrationFilter, PrisonBalanceMigrationFilter } from '../../@types/migration'
import { Context } from '../context'
import PrisonBalanceNomisMigrationClient from '../../data/prisonBalanceNomisMigrationClient'

export default class PrisonBalanceNomisMigrationService {
  constructor(private readonly prisonBalanceNomisMigrationClient: PrisonBalanceNomisMigrationClient) {}

  async startMigration(
    filter: PrisonBalanceMigrationFilter,
    context: Context,
  ): Promise<MigrationContextPrisonBalanceMigrationFilter> {
    return this.prisonBalanceNomisMigrationClient.startMigration(filter, context)
  }
}
