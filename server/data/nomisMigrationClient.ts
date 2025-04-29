import querystring from 'querystring'
import { asSystem, RestClient } from '@ministryofjustice/hmpps-rest-client'
import { AuthenticationClient } from '@ministryofjustice/hmpps-auth-clients'

import { GetDlqResult, InProgressMigration, MigrationHistory, PurgeQueueResult } from '../@types/migration'
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

export default class NomisMigrationClient extends RestClient {
  constructor(authenticationClient: AuthenticationClient) {
    super('Nomis MigrationHistory API Client', config.apis.nomisMigration, logger, authenticationClient)
  }

  async getMigrationHistoryWithFilter(
    migrationType: string,
    context: Context,
    filter: MigrationViewFilter,
  ): Promise<HistoricMigrations> {
    logger.info(`getting migrations with filter ${JSON.stringify(filter)}`)
    return {
      migrations: await this.get<MigrationHistory[]>(
        {
          path: `/migrate/history/all/${migrationType}`,
          query: `${removeEmptyPropertiesAndStringify(filter)}`,
        },
        asSystem(context.username),
      ),
    }
  }

  async getMigration(migrationId: string, context: Context): Promise<HistoricMigrationDetails> {
    logger.info(`getting details for migration ${migrationId}`)
    const history = await this.get<MigrationHistory>(
      {
        path: `/migrate/history/${migrationId}`,
      },
      asSystem(context.username),
    )
    const inProgressMigration = await this.get<InProgressMigration>(
      {
        path: `/migrate/history/active/${history.migrationType}`,
      },
      asSystem(context.username),
    )

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
    return this.post<void>(
      {
        path: `/migrate/cancel/${migrationId}`,
      },
      asSystem(context.username),
    )
  }

  async getFailures(migrationType: string, context: Context): Promise<GetDlqResult> {
    return this.get<GetDlqResult>(
      {
        path: `/migrate/dead-letter-queue/${migrationType}`,
      },
      asSystem(context.username),
    )
  }

  async deleteFailures(migrationType: string, context: Context): Promise<PurgeQueueResult> {
    return this.delete<PurgeQueueResult>(
      {
        path: `/migrate/dead-letter-queue/${migrationType}`,
      },
      asSystem(context.username),
    )
  }

  async getFailureCount(migrationType: string, context: Context): Promise<string> {
    return this.get<string>(
      {
        path: `/migrate/dead-letter-queue/${migrationType}/count`,
      },
      asSystem(context.username),
    )
  }
}
