import { asSystem, RestClient } from '@ministryofjustice/hmpps-rest-client'
import { AuthenticationClient } from '@ministryofjustice/hmpps-auth-clients'
import config from '../config'
import logger from '../../logger'
import { CorporateMigrationFilter, MigrationContextCorporateMigrationFilter } from '../@types/migration'
import { Context } from '../services/context'

export default class CorporateNomisMigrationClient extends RestClient {
  constructor(authenticationClient: AuthenticationClient) {
    super('Corporate Nomis MigrationHistory API Client', config.apis.nomisMigration, logger, authenticationClient)
  }

  async startMigration(
    filter: CorporateMigrationFilter,
    context: Context,
  ): Promise<MigrationContextCorporateMigrationFilter> {
    logger.info(`starting a migration`)
    return this.post<MigrationContextCorporateMigrationFilter>(
      {
        path: `/migrate/corporate`,
        data: filter,
      },
      asSystem(context.username),
    )
  }
}
