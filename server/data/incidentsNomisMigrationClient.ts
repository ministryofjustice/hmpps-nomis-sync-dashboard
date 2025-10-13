import { asSystem, RestClient } from '@ministryofjustice/hmpps-rest-client'
import { AuthenticationClient } from '@ministryofjustice/hmpps-auth-clients'
import config from '../config'
import logger from '../../logger'
import { Context } from '../services/context'
import { IncidentsMigrationFilter, MigrationContextIncidentsMigrationFilter } from '../@types/migration'

export default class IncidentsNomisMigrationClient extends RestClient {
  constructor(authenticationClient: AuthenticationClient) {
    super('Incidents Nomis MigrationHistory API Client', config.apis.nomisMigration, logger, authenticationClient)
  }

  async startIncidentsMigration(
    filter: IncidentsMigrationFilter,
    context: Context,
  ): Promise<MigrationContextIncidentsMigrationFilter> {
    logger.info(`starting an incidents migration`)
    return this.post<MigrationContextIncidentsMigrationFilter>(
      {
        path: `/migrate/incidents`,
        data: filter,
      },
      asSystem(context.username),
    )
  }
}
