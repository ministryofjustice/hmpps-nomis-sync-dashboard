import {
  GetDlqResult,
  InProgressMigration,
  MigrationContextVisitBalanceMigrationFilter,
  MigrationHistory,
  PurgeQueueResult,
  VisitBalanceMigrationFilter,
} from '../../@types/migration'

import type HmppsAuthClient from '../../data/hmppsAuthClient'
import RestClient from '../../data/restClient'
import config from '../../config'
import logger from '../../../logger'
import NomisMigrationService, { Context, HistoricMigrationDetails, HistoricMigrations } from '../nomisMigrationService'

export default class VisitBalanceNomisMigrationService {
  constructor(private readonly hmppsAuthClient: HmppsAuthClient) {}

  private static restClient(token: string): RestClient {
    return new RestClient('Visit Balance Nomis Migration History API Client', config.apis.nomisMigration, token)
  }

  async getMigrations(context: Context): Promise<HistoricMigrations> {
    logger.info(`getting migrations`)
    return {
      migrations: await VisitBalanceNomisMigrationService.restClient(context.token).get<MigrationHistory[]>({
        path: `/migrate/visit-balance/history`,
      }),
    }
  }

  async getMigration(migrationId: string, context: Context): Promise<HistoricMigrationDetails> {
    logger.info(`getting details for migration ${migrationId}`)
    const history = await VisitBalanceNomisMigrationService.restClient(context.token).get<MigrationHistory>({
      path: `/migrate/visit-balance/history/${migrationId}`,
    })

    const inProgressMigration = await VisitBalanceNomisMigrationService.restClient(
      context.token,
    ).get<InProgressMigration>({
      path: `/migrate/visit-balance/active-migration`,
    })

    return {
      history,
      currentProgress: {
        recordsFailed: inProgressMigration.recordsFailed,
        recordsMigrated: inProgressMigration.migrationId === migrationId ? inProgressMigration.recordsMigrated : 0,
        recordsToBeProcessed: inProgressMigration.toBeProcessedCount,
      },
    }
  }

  async startMigration(
    filter: VisitBalanceMigrationFilter,
    context: Context,
  ): Promise<MigrationContextVisitBalanceMigrationFilter> {
    logger.info(`starting a migration`)
    return VisitBalanceNomisMigrationService.restClient(
      context.token,
    ).post<MigrationContextVisitBalanceMigrationFilter>({
      path: `/migrate/visit-balance`,
      data: filter,
    })
  }

  async getFailures(context: Context): Promise<GetDlqResult> {
    logger.info(`getting messages on DLQ`)
    const token = await this.hmppsAuthClient.getSystemClientToken(context.username)
    const dlqName = await VisitBalanceNomisMigrationService.getDLQName(token)

    return VisitBalanceNomisMigrationService.restClient(token).get<GetDlqResult>({
      path: `/queue-admin/get-dlq-messages/${dlqName}`,
    })
  }

  async deleteFailures(context: Context): Promise<PurgeQueueResult> {
    logger.info(`deleting messages on DLQ`)
    const token = await this.hmppsAuthClient.getSystemClientToken(context.username)
    const dlqName = await VisitBalanceNomisMigrationService.getDLQName(token)

    return VisitBalanceNomisMigrationService.restClient(token).put<PurgeQueueResult>({
      path: `/queue-admin/purge-queue/${dlqName}`,
    })
  }

  async getDLQMessageCount(context: Context): Promise<string> {
    return NomisMigrationService.getAnyDLQMessageCount('migrationvisitbalance-health', context.token)
  }

  async cancelMigration(migrationId: string, context: Context): Promise<void> {
    logger.info(`cancelling a migration`)
    return VisitBalanceNomisMigrationService.restClient(context.token).post<void>({
      path: `/migrate/visit-balance/${migrationId}/cancel`,
    })
  }

  private static async getDLQName(token: string): Promise<string> {
    return NomisMigrationService.getAnyDLQName('migrationvisitbalance-health', token)
  }
}
