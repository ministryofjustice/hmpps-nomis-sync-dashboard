import type { MigrationHistory } from '../@types/migration'
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

// type ServerError = { status: number; error: string; message: string }

export default class NomisMigrationService {
  constructor(private readonly hmppsAuthClient: HmppsAuthClient) {}

  private static restClient(token: string): RestClient {
    return new RestClient('Nomis MigrationHistory API Client', config.apis.nomisMigration, token)
  }

  async getVisitMigrations(context: Context): Promise<VisitMigrations> {
    logger.info(`getting details for all courts`)
    return {
      migrations: await NomisMigrationService.restClient(context.token).get<MigrationHistory[]>({
        path: `/migrate/visits/history`,
      }),
    }
  }
}
