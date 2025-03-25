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

  async getAppointmentsMigrations(context: Context): Promise<HistoricMigrations> {
    logger.info(`getting appointments migrations`)
    return {
      migrations: await NomisMigrationService.restClient(context.token).get<MigrationHistory[]>({
        path: `/migrate/appointments/history`,
      }),
    }
  }

  async getAppointmentsMigration(migrationId: string, context: Context): Promise<HistoricMigrationDetails> {
    logger.info(`getting details for appointments migration ${migrationId}`)
    const history = await NomisMigrationService.restClient(context.token).get<MigrationHistory>({
      path: `/migrate/appointments/history/${migrationId}`,
    })

    const inProgressMigration = await NomisMigrationService.restClient(context.token).get<InProgressMigration>({
      path: `/migrate/appointments/active-migration`,
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

  async getAppointmentsFailures(context: Context): Promise<GetDlqResult> {
    logger.info(`getting messages on appointments DLQ`)
    const token = await this.hmppsAuthClient.getSystemClientToken(context.username)
    const dlqName = await NomisMigrationService.getAppointmentsDLQName(token)

    return NomisMigrationService.restClient(token).get<GetDlqResult>({
      path: `/queue-admin/get-dlq-messages/${dlqName}`,
    })
  }

  async deleteAppointmentsFailures(context: Context): Promise<PurgeQueueResult> {
    logger.info(`deleting messages on appointments DLQ`)
    const token = await this.hmppsAuthClient.getSystemClientToken(context.username)
    const dlqName = await NomisMigrationService.getAppointmentsDLQName(token)

    return NomisMigrationService.restClient(token).put<PurgeQueueResult>({
      path: `/queue-admin/purge-queue/${dlqName}`,
    })
  }

  async getAppointmentsDLQMessageCount(context: Context): Promise<string> {
    return NomisMigrationService.getAnyDLQMessageCount('migrationappointments-health', context.token)
  }

  async cancelAppointmentsMigration(migrationId: string, context: Context): Promise<void> {
    logger.info(`cancelling an appointments migration`)
    return NomisMigrationService.restClient(context.token).post<void>({
      path: `/migrate/appointments/${migrationId}/cancel`,
    })
  }

  private static async getAppointmentsDLQName(token: string): Promise<string> {
    return NomisMigrationService.getAnyDLQName('migrationappointments-health', token)
  }

  async getActivitiesMigrations(context: Context): Promise<HistoricMigrations> {
    logger.info(`getting activities migrations`)
    return {
      migrations: await NomisMigrationService.restClient(context.token).get<MigrationHistory[]>({
        path: `/migrate/activities/history`,
      }),
    }
  }

  async getActivitiesMigration(migrationId: string, context: Context): Promise<HistoricMigrationDetails> {
    logger.info(`getting details for activities migration ${migrationId}`)
    const history = await NomisMigrationService.restClient(context.token).get<MigrationHistory>({
      path: `/migrate/activities/history/${migrationId}`,
    })

    const inProgressMigration = await NomisMigrationService.restClient(context.token).get<InProgressMigration>({
      path: `/migrate/activities/active-migration`,
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

  async getActivitiesFailures(context: Context): Promise<GetDlqResult> {
    logger.info(`getting messages on activities DLQ`)
    const token = await this.hmppsAuthClient.getSystemClientToken(context.username)
    const dlqName = await NomisMigrationService.getActivitiesDLQName(token)

    return NomisMigrationService.restClient(token).get<GetDlqResult>({
      path: `/queue-admin/get-dlq-messages/${dlqName}`,
    })
  }

  async deleteActivitiesFailures(context: Context): Promise<PurgeQueueResult> {
    logger.info(`deleting messages on activities DLQ`)
    const token = await this.hmppsAuthClient.getSystemClientToken(context.username)
    const dlqName = await NomisMigrationService.getActivitiesDLQName(token)

    return NomisMigrationService.restClient(token).put<PurgeQueueResult>({
      path: `/queue-admin/purge-queue/${dlqName}`,
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

  async getActivitiesDLQMessageCount(context: Context): Promise<string> {
    return NomisMigrationService.getAnyDLQMessageCount('migrationactivities-health', context.token)
  }

  async cancelActivitiesMigration(migrationId: string, context: Context): Promise<void> {
    logger.info(`cancelling an activities migration`)
    return NomisMigrationService.restClient(context.token).post<void>({
      path: `/migrate/activities/${migrationId}/cancel`,
    })
  }

  private static async getActivitiesDLQName(token: string): Promise<string> {
    return NomisMigrationService.getAnyDLQName('migrationactivities-health', token)
  }

  async getAllocationsMigrations(context: Context): Promise<HistoricMigrations> {
    logger.info(`getting allocations migrations`)
    return {
      migrations: await NomisMigrationService.restClient(context.token).get<MigrationHistory[]>({
        path: `/migrate/allocations/history`,
      }),
    }
  }

  async getAllocationsMigration(migrationId: string, context: Context): Promise<HistoricMigrationDetails> {
    logger.info(`getting details for allocations migration ${migrationId}`)
    const history = await NomisMigrationService.restClient(context.token).get<MigrationHistory>({
      path: `/migrate/allocations/history/${migrationId}`,
    })

    const inProgressMigration = await NomisMigrationService.restClient(context.token).get<InProgressMigration>({
      path: `/migrate/allocations/active-migration`,
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

  async getAllocationsFailures(context: Context): Promise<GetDlqResult> {
    logger.info(`getting messages on allocations DLQ`)
    const token = await this.hmppsAuthClient.getSystemClientToken(context.username)
    const dlqName = await NomisMigrationService.getAllocationsDLQName(token)

    return NomisMigrationService.restClient(token).get<GetDlqResult>({
      path: `/queue-admin/get-dlq-messages/${dlqName}`,
    })
  }

  async deleteAllocationsFailures(context: Context): Promise<PurgeQueueResult> {
    logger.info(`deleting messages on allocations DLQ`)
    const token = await this.hmppsAuthClient.getSystemClientToken(context.username)
    const dlqName = await NomisMigrationService.getAllocationsDLQName(token)

    return NomisMigrationService.restClient(token).put<PurgeQueueResult>({
      path: `/queue-admin/purge-queue/${dlqName}`,
    })
  }

  async getAllocationsDLQMessageCount(context: Context): Promise<string> {
    return NomisMigrationService.getAnyDLQMessageCount('migrationallocations-health', context.token)
  }

  async cancelAllocationsMigration(migrationId: string, context: Context): Promise<void> {
    logger.info(`cancelling an allocations migration`)
    return NomisMigrationService.restClient(context.token).post<void>({
      path: `/migrate/allocations/${migrationId}/cancel`,
    })
  }

  private static async getAllocationsDLQName(token: string): Promise<string> {
    return NomisMigrationService.getAnyDLQName('migrationallocations-health', token)
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

  async getIncidentsMigrations(context: Context): Promise<HistoricMigrations> {
    logger.info(`getting incidents migrations`)
    return {
      migrations: await NomisMigrationService.restClient(context.token).get<MigrationHistory[]>({
        path: `/migrate/incidents/history`,
      }),
    }
  }

  async getIncidentsMigration(migrationId: string, context: Context): Promise<HistoricMigrationDetails> {
    logger.info(`getting details for incidents migration ${migrationId}`)
    const history = await NomisMigrationService.restClient(context.token).get<MigrationHistory>({
      path: `/migrate/incidents/history/${migrationId}`,
    })

    const inProgressMigration = await NomisMigrationService.restClient(context.token).get<InProgressMigration>({
      path: `/migrate/incidents/active-migration`,
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

  async getIncidentsFailures(context: Context): Promise<GetDlqResult> {
    logger.info(`getting messages on incidents DLQ`)
    const token = await this.hmppsAuthClient.getSystemClientToken(context.username)
    const dlqName = await NomisMigrationService.getIncidentsDLQName(token)

    return NomisMigrationService.restClient(token).get<GetDlqResult>({
      path: `/queue-admin/get-dlq-messages/${dlqName}`,
    })
  }

  async deleteIncidentsFailures(context: Context): Promise<PurgeQueueResult> {
    logger.info(`deleting messages on incidents DLQ`)
    const token = await this.hmppsAuthClient.getSystemClientToken(context.username)
    const dlqName = await NomisMigrationService.getIncidentsDLQName(token)

    return NomisMigrationService.restClient(token).put<PurgeQueueResult>({
      path: `/queue-admin/purge-queue/${dlqName}`,
    })
  }

  async getIncidentsDLQMessageCount(context: Context): Promise<string> {
    return NomisMigrationService.getAnyDLQMessageCount('migrationincidents-health', context.token)
  }

  async cancelIncidentsMigration(migrationId: string, context: Context): Promise<void> {
    logger.info(`cancelling an incidents migration`)
    return NomisMigrationService.restClient(context.token).post<void>({
      path: `/migrate/incidents/${migrationId}/cancel`,
    })
  }

  private static async getIncidentsDLQName(token: string): Promise<string> {
    return NomisMigrationService.getAnyDLQName('migrationincidents-health', token)
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
