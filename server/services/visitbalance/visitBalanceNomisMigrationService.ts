import {
  GetDlqResult,
  MigrationContextVisitBalanceMigrationFilter,
  PurgeQueueResult,
  VisitBalanceMigrationFilter,
} from '../../@types/migration'

import type HmppsAuthClient from '../../data/hmppsAuthClient'
import RestClient from '../../data/restClient'
import config from '../../config'
import logger from '../../../logger'
import NomisMigrationService, { Context } from '../nomisMigrationService'

export default class VisitBalanceNomisMigrationService {
  constructor(private readonly hmppsAuthClient: HmppsAuthClient) {}

  private static restClient(token: string): RestClient {
    return new RestClient('Visit Balance Nomis Migration History API Client', config.apis.nomisMigration, token)
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
