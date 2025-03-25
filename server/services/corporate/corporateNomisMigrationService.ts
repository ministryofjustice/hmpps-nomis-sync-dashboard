import { CorporateMigrationFilter, MigrationContextCorporateMigrationFilter } from '../../@types/migration'

import RestClient from '../../data/restClient'
import config from '../../config'
import logger from '../../../logger'
import { Context } from '../nomisMigrationService'

export default class CorporateNomisMigrationService {
  constructor() {}

  private static restClient(token: string): RestClient {
    return new RestClient('Contact Person Nomis MigrationHistory API Client', config.apis.nomisMigration, token)
  }

  async startMigration(
    filter: CorporateMigrationFilter,
    context: Context,
  ): Promise<MigrationContextCorporateMigrationFilter> {
    logger.info(`starting a migration`)
    return CorporateNomisMigrationService.restClient(context.token).post<MigrationContextCorporateMigrationFilter>({
      path: `/migrate/corporate`,
      data: filter,
    })
  }
}
