import { asSystem, RestClient } from '@ministryofjustice/hmpps-rest-client'
import { AuthenticationClient } from '@ministryofjustice/hmpps-auth-clients'
import config from '../config'
import logger from '../../logger'
import { Context } from '../services/context'
import { MigrationContextSentencingMigrationFilter, SentencingMigrationFilter } from '../@types/migration'

export default class SentencingNomisMigrationClient extends RestClient {
  constructor(authenticationClient: AuthenticationClient) {
    super('Sentencing Nomis MigrationHistory API Client', config.apis.nomisMigration, logger, authenticationClient)
  }

  async startSentencingMigration(
    filter: SentencingMigrationFilter,
    context: Context,
  ): Promise<MigrationContextSentencingMigrationFilter> {
    logger.info(`starting a sentencing migration`)
    return this.post<MigrationContextSentencingMigrationFilter>(
      {
        path: `/migrate/sentencing`,
        data: filter,
      },
      asSystem(context.username),
    )
  }
}
