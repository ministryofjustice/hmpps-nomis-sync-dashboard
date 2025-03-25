import { MigrationContextVisitBalanceMigrationFilter, VisitBalanceMigrationFilter } from '../../@types/migration'

import RestClient from '../../data/restClient'
import config from '../../config'
import logger from '../../../logger'
import { Context } from '../nomisMigrationService'

export default class VisitBalanceNomisMigrationService {
  constructor() {}

  private static restClient(token: string): RestClient {
    return new RestClient('Visit Balance Nomis Migration History API Client', config.apis.nomisMigration, token)
  }

  async startMigration(
    filter: VisitBalanceMigrationFilter,
    context: Context,
  ): Promise<MigrationContextVisitBalanceMigrationFilter> {
    logger.info(`starting a migration`)
    return VisitBalanceNomisMigrationService.restClient(
      context.token,
    ).post<MigrationContextVisitBalanceMigrationFilter>({
      path: `/migrate/visit-balance`,
      data: filter,
    })
  }
}
