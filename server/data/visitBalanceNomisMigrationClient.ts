import { asSystem, RestClient } from '@ministryofjustice/hmpps-rest-client'
import { AuthenticationClient } from '@ministryofjustice/hmpps-auth-clients'
import config from '../config'
import logger from '../../logger'
import { Context } from '../services/context'
import { MigrationContextVisitBalanceMigrationFilter, VisitBalanceMigrationFilter } from '../@types/migration'

export default class VisitBalanceNomisMigrationClient extends RestClient {
  constructor(authenticationClient: AuthenticationClient) {
    super('Visit Balance Nomis Migration History API Client', config.apis.nomisMigration, logger, authenticationClient)
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
      asSystem(context.username),
    )
  }
}
