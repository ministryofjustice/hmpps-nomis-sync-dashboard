import { asUser, RestClient } from '@ministryofjustice/hmpps-rest-client'
import config from '../config'
import logger from '../../logger'
import { Context } from '../services/nomisMigrationService'
import { IncidentsMigrationFilter, MigrationContextIncidentsMigrationFilter } from '../@types/migration'

export default class IncidentsNomisMigrationClient extends RestClient {
  constructor() {
    super('Incidents Nomis MigrationHistory API Client', config.apis.nomisMigration, logger)
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
      asUser(context.token),
    )
  }
}
