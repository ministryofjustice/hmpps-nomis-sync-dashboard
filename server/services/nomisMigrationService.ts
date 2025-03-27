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
    return this.getMigrationHistoryWithFilter(migrationType, context, {})
  }

  async getMigrationHistoryWithFilter(
    migrationType: string,
    context: Context,
    filter: MigrationViewFilter,
  ): Promise<HistoricMigrations> {
    logger.info(`getting migrations with filter ${JSON.stringify(filter)}`)
    const token = await this.hmppsAuthClient.getSystemClientToken(context.username)
    return {
      migrations: await NomisMigrationService.restClient(token).get<MigrationHistory[]>({
        path: `/migrate/history/all/${migrationType}`,
        query: `${removeEmptyPropertiesAndStringify(filter)}`,
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
