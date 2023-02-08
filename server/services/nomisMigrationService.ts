import querystring from 'querystring'
import type {
  GetDlqResult,
  MigrationContextVisitsMigrationFilter,
  MigrationHistory,
  VisitsMigrationFilter,
  RoomMappingsResponse,
  PurgeQueueResult,
  IncentivesMigrationFilter,
  MigrationContextIncentivesMigrationFilter,
  SentencingMigrationFilter,
  MigrationContextSentencingMigrationFilter,
} from '../@types/migration'

import type HmppsAuthClient from '../data/hmppsAuthClient'
import RestClient from '../data/restClient'
import config from '../config'
import logger from '../../logger'
import { MigrationViewFilter, VisitsMigrationViewFilter } from '../@types/dashboard'
import { GetVisitsByFilter } from '../@types/nomisPrisoner'

export interface HistoricMigrations {
  migrations: Array<MigrationHistory>
}

export interface HistoricMigrationDetails {
  history: MigrationHistory
  currentProgress: {
    recordsFailed: string
    recordsToBeProcessed: string
    recordsMigrated: number
  }
}
export interface Context {
  username?: string
  token?: string
}

function removeEmptyPropertiesAndStringify(filter: unknown): string {
  const filterWithoutNulls = JSON.parse(JSON.stringify(filter), (key, value) =>
    value === null || value === '' ? undefined : value,
  )
  return querystring.stringify(filterWithoutNulls)
}

export default class NomisMigrationService {
  constructor(private readonly hmppsAuthClient: HmppsAuthClient) {}

  private static restClient(token: string): RestClient {
    return new RestClient('Nomis MigrationHistory API Client', config.apis.nomisMigration, token)
  }

  async getVisitsMigrations(context: Context, filter: VisitsMigrationViewFilter): Promise<HistoricMigrations> {
    logger.info(`getting migrations with filter ${JSON.stringify(filter)}`)
    return {
      migrations: await NomisMigrationService.restClient(context.token).get<MigrationHistory[]>({
        path: `/migrate/visits/history`,
        query: `${removeEmptyPropertiesAndStringify(filter)}`,
      }),
    }
  }

  async getIncentivesMigrations(context: Context, filter: MigrationViewFilter): Promise<HistoricMigrations> {
    logger.info(`getting migrations with filter ${JSON.stringify(filter)}`)
    return {
      migrations: await NomisMigrationService.restClient(context.token).get<MigrationHistory[]>({
        path: `/migrate/incentives/history`,
        query: `${removeEmptyPropertiesAndStringify(filter)}`,
      }),
    }
  }

  async getSentencingMigrations(context: Context, filter: MigrationViewFilter): Promise<HistoricMigrations> {
    logger.info(`getting sentencing migrations with filter ${JSON.stringify(filter)}`)
    return {
      migrations: await NomisMigrationService.restClient(context.token).get<MigrationHistory[]>({
        path: `/migrate/sentencing/history`,
        query: `${removeEmptyPropertiesAndStringify(filter)}`,
      }),
    }
  }

  async getVisitsMigration(migrationId: string, context: Context): Promise<HistoricMigrationDetails> {
    logger.info(`getting details for visit migration ${migrationId}`)
    const history = await NomisMigrationService.restClient(context.token).get<MigrationHistory>({
      path: `/migrate/visits/history/${migrationId}`,
    })

    const info = await NomisMigrationService.restClient(context.token).get<{
      'last visits migration': {
        'records waiting processing': string
        'records that have failed': string
        id: string
        'records migrated': number
      }
    }>({
      path: `/info`,
    })

    return {
      history,
      currentProgress: {
        recordsFailed: info['last visits migration']['records that have failed'],
        recordsMigrated:
          info['last visits migration'].id === migrationId ? info['last visits migration']['records migrated'] : 0,
        recordsToBeProcessed: info['last visits migration']['records waiting processing'],
      },
    }
  }

  async getIncentivesMigration(migrationId: string, context: Context): Promise<HistoricMigrationDetails> {
    logger.info(`getting details for visit migration ${migrationId}`)
    const history = await NomisMigrationService.restClient(context.token).get<MigrationHistory>({
      path: `/migrate/incentives/history/${migrationId}`,
    })

    const info = await NomisMigrationService.restClient(context.token).get<{
      'last incentives migration': {
        'records waiting processing': string
        'records that have failed': string
        id: string
        'records migrated': number
      }
    }>({
      path: `/info`,
    })

    return {
      history,
      currentProgress: {
        recordsFailed: info['last incentives migration']['records that have failed'],
        recordsMigrated:
          info['last incentives migration'].id === migrationId
            ? info['last incentives migration']['records migrated']
            : 0,
        recordsToBeProcessed: info['last incentives migration']['records waiting processing'],
      },
    }
  }

  async getSentencingMigration(migrationId: string, context: Context): Promise<HistoricMigrationDetails> {
    logger.info(`getting details for sentencing migration ${migrationId}`)
    const history = await NomisMigrationService.restClient(context.token).get<MigrationHistory>({
      path: `/migrate/sentencing/history/${migrationId}`,
    })

    const info = await NomisMigrationService.restClient(context.token).get<{
      'last sentencing migration': {
        'records waiting processing': string
        'records that have failed': string
        id: string
        'records migrated': number
      }
    }>({
      path: `/info`,
    })

    return {
      history,
      currentProgress: {
        recordsFailed: info['last sentencing migration']['records that have failed'],
        recordsMigrated:
          info['last sentencing migration'].id === migrationId
            ? info['last sentencing migration']['records migrated']
            : 0,
        recordsToBeProcessed: info['last sentencing migration']['records waiting processing'],
      },
    }
  }

  async startVisitsMigration(
    filter: VisitsMigrationFilter,
    context: Context,
  ): Promise<MigrationContextVisitsMigrationFilter> {
    logger.info(`starting a visits migration`)
    return NomisMigrationService.restClient(context.token).post<MigrationContextVisitsMigrationFilter>({
      path: `/migrate/visits`,
      data: filter,
    })
  }

  async startIncentivesMigration(
    filter: IncentivesMigrationFilter,
    context: Context,
  ): Promise<MigrationContextIncentivesMigrationFilter> {
    logger.info(`starting a incentives migration`)
    return NomisMigrationService.restClient(context.token).post<MigrationContextIncentivesMigrationFilter>({
      path: `/migrate/incentives`,
      data: filter,
    })
  }

  async startSentencingMigration(
    filter: SentencingMigrationFilter,
    context: Context,
  ): Promise<MigrationContextSentencingMigrationFilter> {
    logger.info(`starting a sentencing migration`)
    return NomisMigrationService.restClient(context.token).post<MigrationContextSentencingMigrationFilter>({
      path: `/migrate/sentencing`,
      data: filter,
    })
  }

  async getVisitsFailures(context: Context): Promise<GetDlqResult> {
    logger.info(`getting messages on visits DLQ`)
    const token = await this.hmppsAuthClient.getSystemClientToken(context.username)
    const dlqName = await NomisMigrationService.getVisitsDLQName(token)

    return NomisMigrationService.restClient(token).get<GetDlqResult>({
      path: `/queue-admin/get-dlq-messages/${dlqName}`,
    })
  }

  async getIncentivesFailures(context: Context): Promise<GetDlqResult> {
    logger.info(`getting messages on incentives DLQ`)
    const token = await this.hmppsAuthClient.getSystemClientToken(context.username)
    const dlqName = await NomisMigrationService.getIncentivesDLQName(token)

    return NomisMigrationService.restClient(token).get<GetDlqResult>({
      path: `/queue-admin/get-dlq-messages/${dlqName}`,
    })
  }

  async getSentencingFailures(context: Context): Promise<GetDlqResult> {
    logger.info(`getting messages on sentencing DLQ`)
    const token = await this.hmppsAuthClient.getSystemClientToken(context.username)
    const dlqName = await NomisMigrationService.getSentencingDLQName(token)

    return NomisMigrationService.restClient(token).get<GetDlqResult>({
      path: `/queue-admin/get-dlq-messages/${dlqName}`,
    })
  }

  async deleteVisitsFailures(context: Context): Promise<PurgeQueueResult> {
    logger.info(`deleting messages on DLQ`)
    const token = await this.hmppsAuthClient.getSystemClientToken(context.username)
    const dlqName = await NomisMigrationService.getVisitsDLQName(token)

    return NomisMigrationService.restClient(token).put<PurgeQueueResult>({
      path: `/queue-admin/purge-queue/${dlqName}`,
    })
  }

  async deleteIncentivesFailures(context: Context): Promise<PurgeQueueResult> {
    logger.info(`deleting messages on DLQ`)
    const token = await this.hmppsAuthClient.getSystemClientToken(context.username)
    const dlqName = await NomisMigrationService.getIncentivesDLQName(token)

    return NomisMigrationService.restClient(token).put<PurgeQueueResult>({
      path: `/queue-admin/purge-queue/${dlqName}`,
    })
  }

  async deleteSentencingFailures(context: Context): Promise<PurgeQueueResult> {
    logger.info(`deleting messages on sentencing DLQ`)
    const token = await this.hmppsAuthClient.getSystemClientToken(context.username)
    const dlqName = await NomisMigrationService.getSentencingDLQName(token)

    return NomisMigrationService.restClient(token).put<PurgeQueueResult>({
      path: `/queue-admin/purge-queue/${dlqName}`,
    })
  }

  async getVisitsDLQMessageCount(context: Context): Promise<string> {
    return NomisMigrationService.getAnyDLQMessageCount('migrationvisits-health', context.token)
  }

  async getIncentivesDLQMessageCount(context: Context): Promise<string> {
    return NomisMigrationService.getAnyDLQMessageCount('migrationincentives-health', context.token)
  }

  async getSentencingDLQMessageCount(context: Context): Promise<string> {
    return NomisMigrationService.getAnyDLQMessageCount('migrationsentencing-health', context.token)
  }

  async cancelVisitsMigration(migrationId: string, context: Context): Promise<void> {
    logger.info(`cancelling a visits migration`)
    return NomisMigrationService.restClient(context.token).post<void>({
      path: `/migrate/visits/${migrationId}/cancel`,
    })
  }

  async cancelIncentivesMigration(migrationId: string, context: Context): Promise<void> {
    logger.info(`cancelling a incentives migration`)
    return NomisMigrationService.restClient(context.token).post<void>({
      path: `/migrate/incentives/${migrationId}/cancel`,
    })
  }

  async cancelSentencingMigration(migrationId: string, context: Context): Promise<void> {
    logger.info(`cancelling a sentencing migration`)
    return NomisMigrationService.restClient(context.token).post<void>({
      path: `/migrate/incentives/${migrationId}/cancel`,
    })
  }

  private static async getVisitsDLQName(token: string): Promise<string> {
    return NomisMigrationService.getAnyDLQName('migrationvisits-health', token)
  }

  private static async getIncentivesDLQName(token: string): Promise<string> {
    return NomisMigrationService.getAnyDLQName('migrationincentives-health', token)
  }

  private static async getSentencingDLQName(token: string): Promise<string> {
    return NomisMigrationService.getAnyDLQName('migrationsentencing-health', token)
  }

  private static async getAnyDLQName(queueId: string, token: string): Promise<string> {
    const health = await NomisMigrationService.restClient(token).get<{
      components: Record<
        string,
        {
          details: {
            dlqName: string
            messagesOnDlq: string
          }
        }
      >
    }>({
      path: `/health`,
    })
    return health.components[queueId].details.dlqName
  }

  private static async getAnyDLQMessageCount(queueId: string, token: string): Promise<string> {
    logger.info(`getting DLQ message count`)
    const health = await NomisMigrationService.restClient(token).get<{
      components: Record<
        string,
        {
          details: {
            dlqName: string
            messagesOnDlq: string
          }
        }
      >
    }>({
      path: `/health`,
    })
    return health.components[queueId].details.messagesOnDlq
  }

  async getVisitMigrationRoomMappings(filter: GetVisitsByFilter, context: Context): Promise<RoomMappingsResponse[]> {
    logger.info(`getting details for visit migration - room mappings`)
    return NomisMigrationService.restClient(context.token).get<RoomMappingsResponse[]>({
      path: `/migrate/visits/rooms/usage`,
      query: `${querystring.stringify({ ...filter, size: 1 })}`,
    })
  }
}
