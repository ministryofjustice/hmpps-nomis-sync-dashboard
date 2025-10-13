import { asSystem, RestClient } from '@ministryofjustice/hmpps-rest-client'
import { AuthenticationClient } from '@ministryofjustice/hmpps-auth-clients'
import config from '../config'
import logger from '../../logger'
import { Context } from '../services/context'
import { MigrationContextPrisonerBalanceMigrationFilter, PrisonerBalanceMigrationFilter } from '../@types/migration'

export default class PrisonerBalanceNomisMigrationClient extends RestClient {
  constructor(authenticationClient: AuthenticationClient) {
    super(
      'Prisoner Balance Nomis Migration History API Client',
      config.apis.nomisMigration,
      logger,
      authenticationClient,
    )
  }

  async startMigration(
    filter: PrisonerBalanceMigrationFilter,
    context: Context,
  ): Promise<MigrationContextPrisonerBalanceMigrationFilter> {
    logger.info(`starting a migration`)
    return this.post<MigrationContextPrisonerBalanceMigrationFilter>(
      {
        path: `/migrate/prisoner-balance`,
        data: filter,
      },
      asSystem(context.username),
    )
  }
}
