import { MigrationContextVisitBalanceMigrationFilter, VisitBalanceMigrationFilter } from '../../@types/migration'
import { Context } from '../context'
import VisitBalanceNomisMigrationClient from '../../data/visitBalanceNomisMigrationClient'

export default class VisitBalanceNomisMigrationService {
  constructor(private readonly visitBalanceNomisMigrationClient: VisitBalanceNomisMigrationClient) {}

  async startMigration(
    filter: VisitBalanceMigrationFilter,
    context: Context,
  ): Promise<MigrationContextVisitBalanceMigrationFilter> {
    return this.visitBalanceNomisMigrationClient.startMigration(filter, context)
  }
}
