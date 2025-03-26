import querystring from 'querystring'
import {
  ActivitiesMigrationFilter,
  CourtSentencingMigrationFilter,
  AllocationsMigrationFilter,
  AppointmentsMigrationFilter,
  GetDlqResult,
  InProgressMigration,
  IncidentsMigrationFilter,
  MigrationContextActivitiesMigrationFilter,
  MigrationContextCourtSentencingMigrationFilter,
  MigrationContextAllocationsMigrationFilter,
  MigrationContextAppointmentsMigrationFilter,
  MigrationContextIncidentsMigrationFilter,
  MigrationContextSentencingMigrationFilter,
  MigrationContextVisitsMigrationFilter,
  MigrationHistory,
  PurgeQueueResult,
  RoomMappingsResponse,
  SentencingMigrationFilter,
  VisitsMigrationFilter,
} from '../@types/migration'

import type HmppsAuthClient from '../data/hmppsAuthClient'
import RestClient from '../data/restClient'
import config from '../config'
import logger from '../../logger'
import { MigrationViewFilter } from '../@types/dashboard'
import { GetVisitsByFilter } from '../@types/nomisPrisoner'

export interface HistoricMigrations {
  migrations: Array<MigrationHistory>
}

export interface HistoricMigrationDetails {
  history: MigrationHistory
  currentProgress: {
    recordsFailed: number
    recordsToBeProcessed: number
    recordsMigrated: number
  }
}
export interface Context {
  username?: string
  token?: string
}

export function removeEmptyPropertiesAndStringify(filter: unknown): string {
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

  async getMigrationHistory(migrationType: string, context: Context): Promise<HistoricMigrations> {
    const token = await this.hmppsAuthClient.getSystemClientToken(context.username)
    return {
      migrations: await NomisMigrationService.restClient(token).get<MigrationHistory[]>({
        path: `/migrate/history/all/${migrationType}`,
      }),
    }
  }

  async getMigration(migrationId: string, context: Context): Promise<HistoricMigrationDetails> {
    logger.info(`getting details for migration ${migrationId}`)
    const token = await this.hmppsAuthClient.getSystemClientToken(context.username)
    const history = await NomisMigrationService.restClient(token).get<MigrationHistory>({
      path: `/migrate/history/${migrationId}`,
    })
    const inProgressMigration = await NomisMigrationService.restClient(token).get<InProgressMigration>({
      path: `/migrate/history/active/${history.migrationType}`,
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

  async cancelMigration(migrationId: string, context: Context): Promise<void> {
    logger.info(`cancelling a migration for ${migrationId}`)
    const token = await this.hmppsAuthClient.getSystemClientToken(context.username)
    return NomisMigrationService.restClient(token).post<void>({
      path: `/migrate/cancel/${migrationId}`,
    })
  }

  async getVisitsMigrations(context: Context, filter: MigrationViewFilter): Promise<HistoricMigrations> {
    logger.info(`getting migrations with filter ${JSON.stringify(filter)}`)
    return {
      migrations: await NomisMigrationService.restClient(context.token).get<MigrationHistory[]>({
        path: `/migrate/visits/history`,
        query: `${removeEmptyPropertiesAndStringify(filter)}`,
      }),
    }
  }

  async getVisitsMigration(migrationId: string, context: Context): Promise<HistoricMigrationDetails> {
    logger.info(`getting details for visit migration ${migrationId}`)
    const history = await NomisMigrationService.restClient(context.token).get<MigrationHistory>({
      path: `/migrate/visits/history/${migrationId}`,
    })

    const inProgressMigration = await NomisMigrationService.restClient(context.token).get<InProgressMigration>({
      path: `/migrate/visits/active-migration`,
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

  async getVisitsFailures(context: Context): Promise<GetDlqResult> {
    logger.info(`getting messages on visits DLQ`)
    const token = await this.hmppsAuthClient.getSystemClientToken(context.username)
    const dlqName = await NomisMigrationService.getVisitsDLQName(token)

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

  async getVisitsDLQMessageCount(context: Context): Promise<string> {
    return NomisMigrationService.getAnyDLQMessageCount('migrationvisits-health', context.token)
  }

  async cancelVisitsMigration(migrationId: string, context: Context): Promise<void> {
    logger.info(`cancelling a visits migration`)
    return NomisMigrationService.restClient(context.token).post<void>({
      path: `/migrate/visits/${migrationId}/cancel`,
    })
  }

  private static async getVisitsDLQName(token: string): Promise<string> {
    return NomisMigrationService.getAnyDLQName('migrationvisits-health', token)
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

  async startAppointmentsMigration(
    filter: AppointmentsMigrationFilter,
    context: Context,
  ): Promise<MigrationContextAppointmentsMigrationFilter> {
    logger.info(`starting a appointments migration`)
    return NomisMigrationService.restClient(context.token).post<MigrationContextAppointmentsMigrationFilter>({
      path: `/migrate/appointments`,
      data: filter,
    })
  }

  async startActivitiesMigration(
    filter: ActivitiesMigrationFilter,
    context: Context,
  ): Promise<MigrationContextActivitiesMigrationFilter> {
    logger.info(`starting an activities migration`)
    return NomisMigrationService.restClient(context.token).post<MigrationContextActivitiesMigrationFilter>({
      path: `/migrate/activities`,
      data: filter,
    })
  }

  async endMigratedActivities(context: Context, migrationId: string): Promise<string> {
    logger.info(`Ending NOMIS activities for migrationId=${migrationId}`)
    try {
      await NomisMigrationService.restClient(context.token).put<void>({
        path: `/migrate/activities/${migrationId}/end`,
      })
    } catch (e) {
      switch (e.status) {
        case 404:
          return 'Not found'
        default:
          return 'Error'
      }
    }
    return 'OK'
  }

  async startAllocationsMigration(
    filter: AllocationsMigrationFilter,
    context: Context,
  ): Promise<MigrationContextAllocationsMigrationFilter> {
    logger.info(`starting an allocations migration`)
    return NomisMigrationService.restClient(context.token).post<MigrationContextAllocationsMigrationFilter>({
      path: `/migrate/allocations`,
      data: filter,
    })
  }

  async getCourtSentencingMigrations(context: Context): Promise<HistoricMigrations> {
    logger.info(`getting court sentencing migrations`)
    return {
      migrations: await NomisMigrationService.restClient(context.token).get<MigrationHistory[]>({
        path: `/migrate/court-sentencing/history`,
      }),
    }
  }

  async getCourtSentencingMigration(migrationId: string, context: Context): Promise<HistoricMigrationDetails> {
    logger.info(`getting details for court sentencing migration ${migrationId}`)
    const history = await NomisMigrationService.restClient(context.token).get<MigrationHistory>({
      path: `/migrate/court-sentencing/history/${migrationId}`,
    })

    const inProgressMigration = await NomisMigrationService.restClient(context.token).get<InProgressMigration>({
      path: `/migrate/court-sentencing/active-migration`,
    })

    return {
      history,
      currentProgress: {
        recordsFailed: inProgressMigration.recordsFailed,
        recordsMigrated: inProgressMigration.recordsMigrated,
        recordsToBeProcessed: inProgressMigration.toBeProcessedCount,
      },
    }
  }

  async startCourtSentencingMigration(
    filter: CourtSentencingMigrationFilter,
    context: Context,
  ): Promise<MigrationContextCourtSentencingMigrationFilter> {
    logger.info(`starting a court sentencing migration`)
    return NomisMigrationService.restClient(context.token).post<MigrationContextCourtSentencingMigrationFilter>({
      path: `/migrate/court-sentencing`,
      data: filter,
    })
  }

  async getCourtSentencingFailures(context: Context): Promise<GetDlqResult> {
    logger.info(`getting messages on court sentencing DLQ`)
    const token = await this.hmppsAuthClient.getSystemClientToken(context.username)
    const dlqName = await NomisMigrationService.getCourtSentencingDLQName(token)

    return NomisMigrationService.restClient(token).get<GetDlqResult>({
      path: `/queue-admin/get-dlq-messages/${dlqName}`,
    })
  }

  async deleteCourtSentencingFailures(context: Context): Promise<PurgeQueueResult> {
    logger.info(`deleting messages on court sentencing DLQ`)
    const token = await this.hmppsAuthClient.getSystemClientToken(context.username)
    const dlqName = await NomisMigrationService.getCourtSentencingDLQName(token)

    return NomisMigrationService.restClient(token).put<PurgeQueueResult>({
      path: `/queue-admin/purge-queue/${dlqName}`,
    })
  }

  async getCourtSentencingDLQMessageCount(context: Context): Promise<string> {
    return NomisMigrationService.getAnyDLQMessageCount('migrationcourtsentencing-health', context.token)
  }

  async cancelCourtSentencingMigration(migrationId: string, context: Context): Promise<void> {
    logger.info(`cancelling an court sentencing migration`)
    return NomisMigrationService.restClient(context.token).post<void>({
      path: `/migrate/court-sentencing/${migrationId}/cancel`,
    })
  }

  private static async getCourtSentencingDLQName(token: string): Promise<string> {
    return NomisMigrationService.getAnyDLQName('migrationcourtsentencing-health', token)
  }

  static async getAnyDLQName(queueId: string, token: string): Promise<string> {
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

  static async getAnyDLQMessageCount(queueId: string, token: string): Promise<string> {
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

  // INCIDENTS

  async startIncidentsMigration(
    filter: IncidentsMigrationFilter,
    context: Context,
  ): Promise<MigrationContextIncidentsMigrationFilter> {
    logger.info(`starting an incidents migration`)
    return NomisMigrationService.restClient(context.token).post<MigrationContextIncidentsMigrationFilter>({
      path: `/migrate/incidents`,
      data: filter,
    })
  }

  async getFailures(migrationType: string, context: Context): Promise<GetDlqResult> {
    const token = await this.hmppsAuthClient.getSystemClientToken(context.username)

    return NomisMigrationService.restClient(token).get<GetDlqResult>({
      path: `/migrate/dead-letter-queue/${migrationType}`,
    })
  }

  async deleteFailures(migrationType: string, context: Context): Promise<PurgeQueueResult> {
    const token = await this.hmppsAuthClient.getSystemClientToken(context.username)

    return NomisMigrationService.restClient(token).delete<PurgeQueueResult>({
      path: `/migrate/dead-letter-queue/${migrationType}`,
    })
  }

  async getFailureCount(migrationType: string, context: Context): Promise<string> {
    const token = await this.hmppsAuthClient.getSystemClientToken(context.username)

    return NomisMigrationService.restClient(token).get<string>({
      path: `/migrate/dead-letter-queue/${migrationType}/count`,
    })
  }
}
