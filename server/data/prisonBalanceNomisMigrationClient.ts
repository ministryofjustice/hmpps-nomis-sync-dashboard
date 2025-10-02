import { asUser, RestClient } from '@ministryofjustice/hmpps-rest-client'
import config from '../config'
import logger from '../../logger'
import { Context } from '../services/context'
import { MigrationContextPrisonBalanceMigrationFilter, PrisonBalanceMigrationFilter } from '../@types/migration'

export default class PrisonBalanceNomisMigrationClient extends RestClient {
  constructor() {
    super('Prison Balance Nomis Migration History API Client', config.apis.nomisMigration, logger)
  }

  async startMigration(
    filter: PrisonBalanceMigrationFilter,
    context: Context,
  ): Promise<MigrationContextPrisonBalanceMigrationFilter> {
    logger.info(`starting a migration`)
    return this.post<MigrationContextPrisonBalanceMigrationFilter>(
      {
        path: `/migrate/prison-balance`,
        data: filter,
      },
      asUser(context.token),
    )
  }
}
