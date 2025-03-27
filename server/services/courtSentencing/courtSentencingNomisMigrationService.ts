import { CourtSentencingMigrationFilter, MigrationContextCourtSentencingMigrationFilter } from '../../@types/migration'

import RestClient from '../../data/restClient'
import config from '../../config'
import logger from '../../../logger'
import { Context } from '../nomisMigrationService'

export default class CourtSentencingNomisMigrationService {
  constructor() {}

  private static restClient(token: string): RestClient {
    return new RestClient('CourtSentencing Nomis MigrationHistory API Client', config.apis.nomisMigration, token)
  }

  async startCourtSentencingMigration(
    filter: CourtSentencingMigrationFilter,
    context: Context,
  ): Promise<MigrationContextCourtSentencingMigrationFilter> {
    logger.info(`starting a court sentencing migration`)
    return CourtSentencingNomisMigrationService.restClient(
      context.token,
    ).post<MigrationContextCourtSentencingMigrationFilter>({
      path: `/migrate/court-sentencing`,
      data: filter,
    })
  }
}
