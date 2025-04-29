import { asUser, RestClient } from '@ministryofjustice/hmpps-rest-client'

import config from '../config'
import logger from '../../logger'
import { ContactPersonMigrationFilter, MigrationContextContactPersonMigrationFilter } from '../@types/migration'
import { Context } from '../services/context'

export default class ContactPersonNomisMigrationClient extends RestClient {
  constructor() {
    super('Contact Person Nomis MigrationHistory API Client', config.apis.nomisMigration, logger)
  }

  async startMigration(
    filter: ContactPersonMigrationFilter,
    context: Context,
  ): Promise<MigrationContextContactPersonMigrationFilter> {
    logger.info(`starting a migration`)
    return this.post<MigrationContextContactPersonMigrationFilter>(
      {
        path: `/migrate/contactperson`,
        data: filter,
      },
      asUser(context.token),
    )
  }
}
