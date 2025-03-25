import { ContactPersonMigrationFilter, MigrationContextContactPersonMigrationFilter } from '../../@types/migration'

import RestClient from '../../data/restClient'
import config from '../../config'
import logger from '../../../logger'
import { Context } from '../nomisMigrationService'

export default class ContactPersonNomisMigrationService {
  constructor() {}

  private static restClient(token: string): RestClient {
    return new RestClient('Contact Person Nomis MigrationHistory API Client', config.apis.nomisMigration, token)
  }

  async startMigration(
    filter: ContactPersonMigrationFilter,
    context: Context,
  ): Promise<MigrationContextContactPersonMigrationFilter> {
    logger.info(`starting a migration`)
    return ContactPersonNomisMigrationService.restClient(
      context.token,
    ).post<MigrationContextContactPersonMigrationFilter>({
      path: `/migrate/contactperson`,
      data: filter,
    })
  }
}
