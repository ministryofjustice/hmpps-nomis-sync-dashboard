import { asSystem, RestClient } from '@ministryofjustice/hmpps-rest-client'
import { AuthenticationClient } from '@ministryofjustice/hmpps-auth-clients'
import config from '../config'
import logger from '../../logger'
import { Context } from '../services/context'
import { MigrationContextCorePersonMigrationFilter } from '../@types/migration'

export default class CorePersonNomisMigrationClient extends RestClient {
  constructor(authenticationClient: AuthenticationClient) {
    super('Core Person Nomis MigrationHistory API Client', config.apis.nomisMigration, logger, authenticationClient)
  }

  async startMigration(context: Context): Promise<MigrationContextCorePersonMigrationFilter> {
    logger.info(`starting a migration`)
    return this.post<MigrationContextCorePersonMigrationFilter>(
      {
        path: `/migrate/core-person`,
      },
      asSystem(context.username),
    )
  }
}
