import { asSystem, RestClient } from '@ministryofjustice/hmpps-rest-client'
import { AuthenticationClient } from '@ministryofjustice/hmpps-auth-clients'
import config from '../config'
import logger from '../../logger'
import { MigrationContextOfficialVisitsMigrationFilter, OfficialVisitsMigrationFilter } from '../@types/migration'
import { Context } from '../services/context'

export default class OfficialvisitsNomisMigrationClient extends RestClient {
  constructor(authenticationClient: AuthenticationClient) {
    super('Official Visits Nomis MigrationHistory API Client', config.apis.nomisMigration, logger, authenticationClient)
  }

  async startMigration(
    filter: OfficialVisitsMigrationFilter,
    context: Context,
  ): Promise<MigrationContextOfficialVisitsMigrationFilter> {
    logger.info(`starting a migration`)
    return this.post<MigrationContextOfficialVisitsMigrationFilter>(
      {
        path: `/migrate/officialvisits`,
        data: filter,
      },
      asSystem(context.username),
    )
  }
}
