import { asUser, RestClient } from '@ministryofjustice/hmpps-rest-client'
import config from '../config'
import logger from '../../logger'
import { Context } from '../services/nomisMigrationService'
import { MigrationContextVisitBalanceMigrationFilter, VisitBalanceMigrationFilter } from '../@types/migration'

export default class VisitBalanceNomisMigrationClient extends RestClient {
  constructor() {
    super('Visit Balance Nomis Migration History API Client', config.apis.nomisMigration, logger)
  }

  async startMigration(
    filter: VisitBalanceMigrationFilter,
    context: Context,
  ): Promise<MigrationContextVisitBalanceMigrationFilter> {
    logger.info(`starting a migration`)
    return this.post<MigrationContextVisitBalanceMigrationFilter>(
      {
        path: `/migrate/visit-balance`,
        data: filter,
      },
      asUser(context.token),
    )
  }
}
