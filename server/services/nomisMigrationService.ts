import querystring from 'querystring'
import type {
  GetDlqResult,
  MigrationContextVisitsMigrationFilter,
  MigrationHistory,
  VisitsMigrationFilter,
  RoomMappingsResponse,
  PurgeQueueResult,
} from '../@types/migration'

import type HmppsAuthClient from '../data/hmppsAuthClient'
import RestClient from '../data/restClient'
import config from '../config'
import logger from '../../logger'
import { MigrationViewFilter } from '../@types/dashboard'
import { GetVisitsByFilter } from '../@types/nomisPrisoner'

export interface VisitMigrations {
  migrations: Array<MigrationHistory>
}

export interface VisitsMigrationDetails {
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

function removeEmptyPropertiesAndStringify(filter: MigrationViewFilter): string {
  const filterWithoutNulls = JSON.parse(JSON.stringify(filter), (key, value) =>
    value === null || value === '' ? undefined : value
  )
  return querystring.stringify(filterWithoutNulls)
}

export default class NomisMigrationService {
  constructor(private readonly hmppsAuthClient: HmppsAuthClient) {}

  private static restClient(token: string): RestClient {
    return new RestClient('Nomis MigrationHistory API Client', config.apis.nomisMigration, token)
  }

  async getVisitsMigrations(context: Context, filter: MigrationViewFilter): Promise<VisitMigrations> {
    logger.info(`getting migrations with filter ${JSON.stringify(filter)}`)
    return {
      migrations: await NomisMigrationService.restClient(context.token).get<MigrationHistory[]>({
        path: `/migrate/visits/history`,
        query: `${removeEmptyPropertiesAndStringify(filter)}`,
      }),
    }
  }

  async getVisitsMigration(migrationId: string, context: Context): Promise<VisitsMigrationDetails> {
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

  async startVisitsMigration(
    filter: VisitsMigrationFilter,
    context: Context
  ): Promise<MigrationContextVisitsMigrationFilter> {
    logger.info(`starting a visits migration`)
    return NomisMigrationService.restClient(context.token).post<MigrationContextVisitsMigrationFilter>({
      path: `/migrate/visits`,
      data: filter,
    })
  }

  async getFailures(context: Context): Promise<GetDlqResult> {
    logger.info(`getting messages on DLQ`)
    const token = await this.hmppsAuthClient.getSystemClientToken(context.username)
    const dlqName = await NomisMigrationService.getDLQName(token)

    return NomisMigrationService.restClient(token).get<GetDlqResult>({
      path: `/queue-admin-async/get-dlq-messages/${dlqName}`,
    })
  }

  async deleteFailures(context: Context): Promise<PurgeQueueResult> {
    logger.info(`deleting messages on DLQ`)
    const token = await this.hmppsAuthClient.getSystemClientToken(context.username)
    const dlqName = await NomisMigrationService.getDLQName(token)

    return NomisMigrationService.restClient(token).put<PurgeQueueResult>({
      path: `/queue-admin-async/purge-queue/${dlqName}`,
    })
  }

  async getDLQMessageCount(context: Context): Promise<string> {
    logger.info(`getting DLQ message count`)
    const token = await this.hmppsAuthClient.getSystemClientToken(context.username)
    const health = await NomisMigrationService.restClient(token).get<{
      components: {
        'migration-health': {
          details: {
            dlqName: string
            messagesOnDlq: string
          }
        }
      }
    }>({
      path: `/health`,
    })
    return health.components['migration-health'].details.messagesOnDlq
  }

  async cancelVisitsMigration(migrationId: string, context: Context): Promise<void> {
    logger.info(`cancelling a visits migration`)
    return NomisMigrationService.restClient(context.token).post<void>({
      path: `/migrate/visits/${migrationId}/cancel`,
    })
  }

  private static async getDLQName(token: string): Promise<string> {
    const health = await NomisMigrationService.restClient(token).get<{
      components: {
        'migration-health': {
          details: {
            dlqName: string
          }
        }
      }
    }>({
      path: `/health`,
    })
    return health.components['migration-health'].details.dlqName
  }

  async getVisitMigrationRoomMappings(filter: GetVisitsByFilter, context: Context): Promise<RoomMappingsResponse[]> {
    logger.info(`getting details for visit migration - room mappings`)
    return NomisMigrationService.restClient(context.token).get<RoomMappingsResponse[]>({
      path: `/migrate/visits/rooms/usage`,
      query: `${querystring.stringify({ ...filter, size: 1 })}`,
    })
  }
}
