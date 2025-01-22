import {
  GetDlqResult,
  InProgressMigration,
  MigrationHistory,
  PurgeQueueResult,
  MigrationContextCorePersonMigrationFilter,
} from '../../@types/migration'

import type HmppsAuthClient from '../../data/hmppsAuthClient'
import RestClient from '../../data/restClient'
import config from '../../config'
import logger from '../../../logger'
import NomisMigrationService, { Context, HistoricMigrationDetails, HistoricMigrations } from '../nomisMigrationService'

export default class CorePersonNomisMigrationService {
  constructor(private readonly hmppsAuthClient: HmppsAuthClient) {}

  private static restClient(token: string): RestClient {
    return new RestClient('Core Person Nomis MigrationHistory API Client', config.apis.nomisMigration, token)
  }

  async getMigrations(context: Context): Promise<HistoricMigrations> {
    logger.info(`getting migrations`)
    return {
      migrations: await CorePersonNomisMigrationService.restClient(context.token).get<MigrationHistory[]>({
        path: `/migrate/core-person/history`,
      }),
    }
  }

  async getMigration(migrationId: string, context: Context): Promise<HistoricMigrationDetails> {
    logger.info(`getting details for migration ${migrationId}`)
    const history = await CorePersonNomisMigrationService.restClient(context.token).get<MigrationHistory>({
      path: `/migrate/core-person/history/${migrationId}`,
    })

    const inProgressMigration = await CorePersonNomisMigrationService.restClient(
      context.token,
    ).get<InProgressMigration>({
      path: `/migrate/core-person/active-migration`,
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

  async startMigration(context: Context): Promise<MigrationContextCorePersonMigrationFilter> {
    logger.info(`starting a migration`)
    return CorePersonNomisMigrationService.restClient(context.token).post<MigrationContextCorePersonMigrationFilter>({
      path: `/migrate/core-person`,
    })
  }

  async getFailures(context: Context): Promise<GetDlqResult> {
    logger.info(`getting messages on DLQ`)
    const token = await this.hmppsAuthClient.getSystemClientToken(context.username)
    const dlqName = await CorePersonNomisMigrationService.getDLQName(token)

    return CorePersonNomisMigrationService.restClient(token).get<GetDlqResult>({
      path: `/queue-admin/get-dlq-messages/${dlqName}`,
    })
  }

  async deleteFailures(context: Context): Promise<PurgeQueueResult> {
    logger.info(`deleting messages on DLQ`)
    const token = await this.hmppsAuthClient.getSystemClientToken(context.username)
    const dlqName = await CorePersonNomisMigrationService.getDLQName(token)

    return CorePersonNomisMigrationService.restClient(token).put<PurgeQueueResult>({
      path: `/queue-admin/purge-queue/${dlqName}`,
    })
  }

  async getDLQMessageCount(context: Context): Promise<string> {
    return NomisMigrationService.getAnyDLQMessageCount('migrationcoreperson-health', context.token)
  }

  async cancelMigration(migrationId: string, context: Context): Promise<void> {
    logger.info(`cancelling a migration`)
    return CorePersonNomisMigrationService.restClient(context.token).post<void>({
      path: `/migrate/core-person/${migrationId}/cancel`,
    })
  }

  private static async getDLQName(token: string): Promise<string> {
    return NomisMigrationService.getAnyDLQName('migrationcoreperson-health', token)
  }
}
