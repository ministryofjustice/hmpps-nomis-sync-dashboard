import {
  CorporateMigrationFilter,
  GetDlqResult,
  InProgressMigration,
  MigrationContextCorporateMigrationFilter,
  MigrationHistory,
  PurgeQueueResult,
} from '../../@types/migration'

import type HmppsAuthClient from '../../data/hmppsAuthClient'
import RestClient from '../../data/restClient'
import config from '../../config'
import logger from '../../../logger'
import NomisMigrationService, { Context, HistoricMigrationDetails, HistoricMigrations } from '../nomisMigrationService'

export default class CorporateNomisMigrationService {
  constructor(private readonly hmppsAuthClient: HmppsAuthClient) {}

  private static restClient(token: string): RestClient {
    return new RestClient('Contact Person Nomis MigrationHistory API Client', config.apis.nomisMigration, token)
  }

  async getMigrations(context: Context): Promise<HistoricMigrations> {
    logger.info(`getting migrations`)
    return {
      migrations: await CorporateNomisMigrationService.restClient(context.token).get<MigrationHistory[]>({
        path: `/migrate/corporate/history`,
      }),
    }
  }

  async getMigration(migrationId: string, context: Context): Promise<HistoricMigrationDetails> {
    logger.info(`getting details for migration ${migrationId}`)
    const history = await CorporateNomisMigrationService.restClient(context.token).get<MigrationHistory>({
      path: `/migrate/corporate/history/${migrationId}`,
    })

    const inProgressMigration = await CorporateNomisMigrationService.restClient(context.token).get<InProgressMigration>(
      {
        path: `/migrate/corporate/active-migration`,
      },
    )

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
    filter: CorporateMigrationFilter,
    context: Context,
  ): Promise<MigrationContextCorporateMigrationFilter> {
    logger.info(`starting a migration`)
    return CorporateNomisMigrationService.restClient(context.token).post<MigrationContextCorporateMigrationFilter>({
      path: `/migrate/corporate`,
      data: filter,
    })
  }

  async getFailures(context: Context): Promise<GetDlqResult> {
    logger.info(`getting messages on DLQ`)
    const token = await this.hmppsAuthClient.getSystemClientToken(context.username)
    const dlqName = await CorporateNomisMigrationService.getDLQName(token)

    return CorporateNomisMigrationService.restClient(token).get<GetDlqResult>({
      path: `/queue-admin/get-dlq-messages/${dlqName}`,
    })
  }

  async deleteFailures(context: Context): Promise<PurgeQueueResult> {
    logger.info(`deleting messages on DLQ`)
    const token = await this.hmppsAuthClient.getSystemClientToken(context.username)
    const dlqName = await CorporateNomisMigrationService.getDLQName(token)

    return CorporateNomisMigrationService.restClient(token).put<PurgeQueueResult>({
      path: `/queue-admin/purge-queue/${dlqName}`,
    })
  }

  async getDLQMessageCount(context: Context): Promise<string> {
    return NomisMigrationService.getAnyDLQMessageCount('migrationcorporate-health', context.token)
  }

  async cancelMigration(migrationId: string, context: Context): Promise<void> {
    logger.info(`cancelling a migration`)
    return CorporateNomisMigrationService.restClient(context.token).post<void>({
      path: `/migrate/corporate/${migrationId}/cancel`,
    })
  }

  private static async getDLQName(token: string): Promise<string> {
    return NomisMigrationService.getAnyDLQName('migrationcorporate-health', token)
  }
}
