import { GetDlqResult, PurgeQueueResult, MigrationContextCorePersonMigrationFilter } from '../../@types/migration'

import type HmppsAuthClient from '../../data/hmppsAuthClient'
import RestClient from '../../data/restClient'
import config from '../../config'
import logger from '../../../logger'
import NomisMigrationService, { Context } from '../nomisMigrationService'

export default class CorePersonNomisMigrationService {
  constructor(private readonly hmppsAuthClient: HmppsAuthClient) {}

  private static restClient(token: string): RestClient {
    return new RestClient('Core Person Nomis MigrationHistory API Client', config.apis.nomisMigration, token)
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
