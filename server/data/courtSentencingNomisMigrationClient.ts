import { asSystem, RestClient } from '@ministryofjustice/hmpps-rest-client'
import { AuthenticationClient } from '@ministryofjustice/hmpps-auth-clients'
import config from '../config'
import logger from '../../logger'
import { Context } from '../services/context'
import { CourtSentencingMigrationFilter, MigrationContextCourtSentencingMigrationFilter } from '../@types/migration'

export default class CourtSentencingNomisMigrationClient extends RestClient {
  constructor(authenticationClient: AuthenticationClient) {
    super('CourtSentencing Nomis MigrationHistory API Client', config.apis.nomisMigration, logger, authenticationClient)
  }

  async startCourtSentencingMigration(
    filter: CourtSentencingMigrationFilter,
    context: Context,
  ): Promise<MigrationContextCourtSentencingMigrationFilter> {
    logger.info(`starting a court sentencing migration`)
    return this.post<MigrationContextCourtSentencingMigrationFilter>(
      {
        path: `/migrate/court-sentencing`,
        data: filter,
      },
      asSystem(context.username),
    )
  }
}
