import {
  GetDlqResult,
  InProgressMigration,
  MigrationHistory,
  PurgeQueueResult,
  ContactPersonMigrationFilter,
  MigrationContextContactPersonMigrationFilter,
} from '../../@types/migration'

import type HmppsAuthClient from '../../data/hmppsAuthClient'
import RestClient from '../../data/restClient'
import config from '../../config'
import logger from '../../../logger'
import NomisMigrationService, { Context, HistoricMigrationDetails, HistoricMigrations } from '../nomisMigrationService'

export default class ContactPersonNomisMigrationService {
  constructor(private readonly hmppsAuthClient: HmppsAuthClient) {}

  private static restClient(token: string): RestClient {
    return new RestClient('Contact Person Nomis MigrationHistory API Client', config.apis.nomisMigration, token)
  }

  async getMigrations(context: Context): Promise<HistoricMigrations> {
    logger.info(`getting migrations`)
    return {
      migrations: await ContactPersonNomisMigrationService.restClient(context.token).get<MigrationHistory[]>({
        path: `/migrate/contactperson/history`,
      }),
    }
  }

  async getMigration(migrationId: string, context: Context): Promise<HistoricMigrationDetails> {
    logger.info(`getting details for migration ${migrationId}`)
    const history = await ContactPersonNomisMigrationService.restClient(context.token).get<MigrationHistory>({
      path: `/migrate/contactperson/history/${migrationId}`,
    })

    const inProgressMigration = await ContactPersonNomisMigrationService.restClient(
      context.token,
    ).get<InProgressMigration>({
      path: `/migrate/contactperson/active-migration`,
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
    filter: ContactPersonMigrationFilter,
    context: Context,
  ): Promise<MigrationContextContactPersonMigrationFilter> {
    logger.info(`starting a migration`)
    return ContactPersonNomisMigrationService.restClient(
      context.token,
    ).post<MigrationContextContactPersonMigrationFilter>({
      path: `/migrate/contactperson`,
      data: filter,
    })
  }

  async getFailures(context: Context): Promise<GetDlqResult> {
    logger.info(`getting messages on DLQ`)
    const token = await this.hmppsAuthClient.getSystemClientToken(context.username)
    const dlqName = await ContactPersonNomisMigrationService.getDLQName(token)

    return ContactPersonNomisMigrationService.restClient(token).get<GetDlqResult>({
      path: `/queue-admin/get-dlq-messages/${dlqName}`,
    })
  }

  async deleteFailures(context: Context): Promise<PurgeQueueResult> {
    logger.info(`deleting messages on DLQ`)
    const token = await this.hmppsAuthClient.getSystemClientToken(context.username)
    const dlqName = await ContactPersonNomisMigrationService.getDLQName(token)

    return ContactPersonNomisMigrationService.restClient(token).put<PurgeQueueResult>({
      path: `/queue-admin/purge-queue/${dlqName}`,
    })
  }

  async getDLQMessageCount(context: Context): Promise<string> {
    return NomisMigrationService.getAnyDLQMessageCount('migrationpersonalrelationships-health', context.token)
  }

  async cancelMigration(migrationId: string, context: Context): Promise<void> {
    logger.info(`cancelling a migration`)
    return ContactPersonNomisMigrationService.restClient(context.token).post<void>({
      path: `/migrate/contactperson/${migrationId}/cancel`,
    })
  }

  private static async getDLQName(token: string): Promise<string> {
    return NomisMigrationService.getAnyDLQName('migrationpersonalrelationships-health', token)
  }
}
