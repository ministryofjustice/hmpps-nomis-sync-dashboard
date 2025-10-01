import { MigrationContextPrisonerBalanceMigrationFilter, PrisonerBalanceMigrationFilter } from '../../@types/migration'
import { Context } from '../context'
import PrisonerBalanceNomisMigrationClient from '../../data/prisonerBalanceNomisMigrationClient'

export default class PrisonerBalanceNomisMigrationService {
  constructor(private readonly prisonerBalanceNomisMigrationClient: PrisonerBalanceNomisMigrationClient) {}

  async startMigration(
    filter: PrisonerBalanceMigrationFilter,
    context: Context,
  ): Promise<MigrationContextPrisonerBalanceMigrationFilter> {
    return this.prisonerBalanceNomisMigrationClient.startMigration(filter, context)
  }
}
