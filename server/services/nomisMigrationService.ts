import querystring from 'querystring'
import { GetDlqResult, InProgressMigration, MigrationHistory, PurgeQueueResult } from '../@types/migration'

import type HmppsAuthClient from '../data/hmppsAuthClient'
import RestClient from '../data/restClient'
import config from '../config'
import logger from '../../logger'
import { MigrationViewFilter } from '../@types/dashboard'

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
  const filterWithoutNulls = JSON.parse(JSON.stringify(filter), (_, value) =>
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
