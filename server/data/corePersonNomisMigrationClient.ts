import { asUser, RestClient } from '@ministryofjustice/hmpps-rest-client'
import config from '../config'
import logger from '../../logger'
import { Context } from '../services/context'
import { MigrationContextCorePersonMigrationFilter } from '../@types/migration'

export default class CorePersonNomisMigrationClient extends RestClient {
  constructor() {
    super('Core Person Nomis MigrationHistory API Client', config.apis.nomisMigration, logger)
  }

  async startMigration(context: Context): Promise<MigrationContextCorePersonMigrationFilter> {
    logger.info(`starting a migration`)
    return this.post<MigrationContextCorePersonMigrationFilter>(
      {
        path: `/migrate/core-person`,
      },
      asUser(context.token),
    )
  }
}
