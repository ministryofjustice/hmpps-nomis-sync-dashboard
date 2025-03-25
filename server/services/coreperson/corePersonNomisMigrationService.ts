import { GetDlqResult, PurgeQueueResult, MigrationContextCorePersonMigrationFilter } from '../../@types/migration'

import type HmppsAuthClient from '../../data/hmppsAuthClient'
import RestClient from '../../data/restClient'
import config from '../../config'
import logger from '../../../logger'
import NomisMigrationService, { Context } from '../nomisMigrationService'

export default class CorePersonNomisMigrationService {
  constructor() {}

  private static restClient(token: string): RestClient {
    return new RestClient('Core Person Nomis MigrationHistory API Client', config.apis.nomisMigration, token)
  }

  async startMigration(context: Context): Promise<MigrationContextCorePersonMigrationFilter> {
    logger.info(`starting a migration`)
    return CorePersonNomisMigrationService.restClient(context.token).post<MigrationContextCorePersonMigrationFilter>({
      path: `/migrate/core-person`,
    })
  }
}
