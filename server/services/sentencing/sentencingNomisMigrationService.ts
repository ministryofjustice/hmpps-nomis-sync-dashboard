import { SentencingMigrationFilter, MigrationContextSentencingMigrationFilter } from '../../@types/migration'

import RestClient from '../../data/restClient'
import config from '../../config'
import logger from '../../../logger'
import { Context } from '../nomisMigrationService'

export default class SentencingNomisMigrationService {
  constructor() {}

  private static restClient(token: string): RestClient {
    return new RestClient('Sentencing Nomis MigrationHistory API Client', config.apis.nomisMigration, token)
  }

  async startSentencingMigration(
    filter: SentencingMigrationFilter,
    context: Context,
  ): Promise<MigrationContextSentencingMigrationFilter> {
    logger.info(`starting a sentencing migration`)
    return SentencingNomisMigrationService.restClient(context.token).post<MigrationContextSentencingMigrationFilter>({
      path: `/migrate/sentencing`,
      data: filter,
    })
  }
}
