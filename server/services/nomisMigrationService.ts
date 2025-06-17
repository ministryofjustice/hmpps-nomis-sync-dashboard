import { GetDlqResult, PurgeQueueResult } from '../@types/migration'
import { MigrationViewFilter } from '../@types/dashboard'
import NomisMigrationClient, { HistoricMigrationDetails, HistoricMigrations } from '../data/nomisMigrationClient'
import { Context } from './context'

export default class NomisMigrationService {
  constructor(private readonly nomisMigrationClient: NomisMigrationClient) {}

  async getMigrationHistory(migrationType: string, context: Context): Promise<HistoricMigrations> {
    return this.getMigrationHistoryWithFilter(migrationType, context, {})
  }

  async getMigrationHistoryWithFilter(
    migrationType: string,
    context: Context,
    filter: MigrationViewFilter,
  ): Promise<HistoricMigrations> {
    return this.nomisMigrationClient.getMigrationHistoryWithFilter(migrationType, context, filter)
  }

  async getMigration(migrationId: string, context: Context): Promise<HistoricMigrationDetails> {
    return this.nomisMigrationClient.getMigration(migrationId, context)
  }

  async cancelMigration(migrationId: string, context: Context): Promise<void> {
    return this.nomisMigrationClient.cancelMigration(migrationId, context)
  }

  async getFailures(migrationType: string, context: Context): Promise<GetDlqResult> {
    return this.nomisMigrationClient.getFailures(migrationType, context)
  }

  async deleteFailures(migrationType: string, context: Context): Promise<PurgeQueueResult> {
    return this.nomisMigrationClient.deleteFailures(migrationType, context)
  }

  async getFailureCount(migrationType: string, context: Context): Promise<string> {
    return this.nomisMigrationClient.getFailureCount(migrationType, context)
  }
}
