import type {
  GetDlqResult,
  MigrationContextVisitsMigrationFilter,
  MigrationHistory,
  VisitsMigrationFilter,
} from '../@types/migration'

import type HmppsAuthClient from '../data/hmppsAuthClient'
import RestClient from '../data/restClient'
import config from '../config'
import logger from '../../logger'

export interface VisitMigrations {
  migrations: Array<MigrationHistory>
}

export interface Context {
  username?: string
  token?: string
}

export default class NomisMigrationService {
  constructor(private readonly hmppsAuthClient: HmppsAuthClient) {}

  private static restClient(token: string): RestClient {
    return new RestClient('Nomis MigrationHistory API Client', config.apis.nomisMigration, token)
  }

  async getVisitMigrations(context: Context): Promise<VisitMigrations> {
    logger.info(`getting details for visit migrations`)
    return {
      migrations: await NomisMigrationService.restClient(context.token).get<MigrationHistory[]>({
        path: `/migrate/visits/history`,
      }),
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
    const dlqName = await this.getDLQName(token)

    return NomisMigrationService.restClient(token).get<GetDlqResult>({
      path: `/queue-admin/get-dlq-messages/${dlqName}`,
    })
  }

  private async getDLQName(token: string): Promise<string> {
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
}
