import type { MigrationContextVisitsMigrationFilter, MigrationHistory } from '../@types/migration'
import { GetVisitsByFilter } from '../@types/nomisPrisoner'

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
    filter: GetVisitsByFilter, // should actual use VisitsMigrationFilter, but this hasn't been generated correctly from swagger, and should be identical to GetVisitsByFilter (allowableValues in swagger has made the type a enum when it shaould be a list)
    context: Context
  ): Promise<MigrationContextVisitsMigrationFilter> {
    logger.info(`starting a visits migration`)
    return NomisMigrationService.restClient(context.token).post<MigrationContextVisitsMigrationFilter>({
      path: `/migrate/visits`,
      data: filter,
    })
  }
}
