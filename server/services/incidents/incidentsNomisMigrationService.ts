import { IncidentsMigrationFilter, MigrationContextIncidentsMigrationFilter } from '../../@types/migration'

import RestClient from '../../data/restClient'
import config from '../../config'
import logger from '../../../logger'
import { Context } from '../nomisMigrationService'

export default class IncidentsNomisMigrationService {
  constructor() {}

  private static restClient(token: string): RestClient {
    return new RestClient('Incidents Nomis MigrationHistory API Client', config.apis.nomisMigration, token)
  }

  async startIncidentsMigration(
    filter: IncidentsMigrationFilter,
    context: Context,
  ): Promise<MigrationContextIncidentsMigrationFilter> {
    logger.info(`starting an incidents migration`)
    return IncidentsNomisMigrationService.restClient(context.token).post<MigrationContextIncidentsMigrationFilter>({
      path: `/migrate/incidents`,
      data: filter,
    })
  }
}
