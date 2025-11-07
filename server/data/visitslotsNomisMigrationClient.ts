import { asSystem, RestClient } from '@ministryofjustice/hmpps-rest-client'
import { AuthenticationClient } from '@ministryofjustice/hmpps-auth-clients'
import config from '../config'
import logger from '../../logger'
import { MigrationContextObject } from '../@types/migration'
import { Context } from '../services/context'

export default class VisitslotsNomisMigrationClient extends RestClient {
  constructor(authenticationClient: AuthenticationClient) {
    super('Visit Slots Nomis MigrationHistory API Client', config.apis.nomisMigration, logger, authenticationClient)
  }

  async startMigration(context: Context): Promise<MigrationContextObject> {
    logger.info(`starting a migration`)
    return this.post<MigrationContextObject>(
      {
        path: `/migrate/visitslots`,
      },
      asSystem(context.username),
    )
  }
}
