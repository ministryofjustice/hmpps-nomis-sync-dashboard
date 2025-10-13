import { asSystem, RestClient } from '@ministryofjustice/hmpps-rest-client'
import { AuthenticationClient } from '@ministryofjustice/hmpps-auth-clients'
import config from '../config'
import logger from '../../logger'
import { Context } from '../services/context'
import { MigrationContextPrisonBalanceMigrationFilter, PrisonBalanceMigrationFilter } from '../@types/migration'

export default class PrisonBalanceNomisMigrationClient extends RestClient {
  constructor(authenticationClient: AuthenticationClient) {
    super('Prison Balance Nomis Migration History API Client', config.apis.nomisMigration, logger, authenticationClient)
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
      asSystem(context.username),
    )
  }
}
