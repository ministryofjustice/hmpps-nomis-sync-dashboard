import { asSystem, RestClient } from '@ministryofjustice/hmpps-rest-client'
import { AuthenticationClient } from '@ministryofjustice/hmpps-auth-clients'
import config from '../config'
import logger from '../../logger'
import { AllocationsMigrationFilter, MigrationContextAllocationsMigrationFilter } from '../@types/migration'
import { Context } from '../services/context'

export default class AllocationsNomisMigrationClient extends RestClient {
  constructor(authenticationClient: AuthenticationClient) {
    super('Appointments Nomis MigrationHistory API Client', config.apis.nomisMigration, logger, authenticationClient)
  }

  async startAllocationsMigration(
    filter: AllocationsMigrationFilter,
    context: Context,
  ): Promise<MigrationContextAllocationsMigrationFilter> {
    logger.info(`starting an allocations migration`)
    return this.post<MigrationContextAllocationsMigrationFilter>(
      {
        path: `/migrate/allocations`,
        data: filter,
      },
      asSystem(context.username),
    )
  }
}
