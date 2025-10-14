import { asSystem, RestClient } from '@ministryofjustice/hmpps-rest-client'
import { AuthenticationClient } from '@ministryofjustice/hmpps-auth-clients'
import config from '../config'
import logger from '../../logger'
import { MigrationContextMovementsMigrationFilter, MovementsMigrationFilter } from '../@types/migration'
import { Context } from '../services/context'

export default class MovementsNomisMigrationClient extends RestClient {
  constructor(authenticationClient: AuthenticationClient) {
    super('Movements Nomis MigrationHistory API Client', config.apis.nomisMigration, logger, authenticationClient)
  }

  async startMigration(
    filter: MovementsMigrationFilter,
    context: Context,
  ): Promise<MigrationContextMovementsMigrationFilter> {
    logger.info(`starting a migration`)
    return this.post<MigrationContextMovementsMigrationFilter>(
      {
        path: `/migrate/external-movements`,
        data: filter,
      },
      asSystem(context.username),
    )
  }
}
