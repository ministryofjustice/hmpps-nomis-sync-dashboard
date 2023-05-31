import querystring from 'querystring'
import type {
  AppointmentsMigrationFilter,
  GetDlqResult,
  InProgressMigration,
  MigrationContextAppointmentsMigrationFilter,
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

  async getSentencingMigrations(context: Context): Promise<HistoricMigrations> {
    logger.info(`getting sentencing migrations`)
    return {
      migrations: await NomisMigrationService.restClient(context.token).get<MigrationHistory[]>({
        path: `/migrate/sentencing/history`,
      }),
    }
  }

  async getSentencingMigration(migrationId: string, context: Context): Promise<HistoricMigrationDetails> {
    logger.info(`getting details for sentencing migration ${migrationId}`)
    const history = await NomisMigrationService.restClient(context.token).get<MigrationHistory>({
      path: `/migrate/sentencing/history/${migrationId}`,
    })

    const inProgressMigration = await NomisMigrationService.restClient(context.token).get<InProgressMigration>({
      path: `/migrate/sentencing/active-migration`,
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

  async getSentencingFailures(context: Context): Promise<GetDlqResult> {
    logger.info(`getting messages on sentencing DLQ`)
    const token = await this.hmppsAuthClient.getSystemClientToken(context.username)
    const dlqName = await NomisMigrationService.getSentencingDLQName(token)

    return NomisMigrationService.restClient(token).get<GetDlqResult>({
      path: `/queue-admin/get-dlq-messages/${dlqName}`,
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

  async getSentencingDLQMessageCount(context: Context): Promise<string> {
    return NomisMigrationService.getAnyDLQMessageCount('migrationsentencing-health', context.token)
  }

  async cancelSentencingMigration(migrationId: string, context: Context): Promise<void> {
    logger.info(`cancelling a sentencing migration`)
    return NomisMigrationService.restClient(context.token).post<void>({
      path: `/migrate/sentencing/${migrationId}/cancel`,
    })
  }

  private static async getSentencingDLQName(token: string): Promise<string> {
    return NomisMigrationService.getAnyDLQName('migrationsentencing-health', token)
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
