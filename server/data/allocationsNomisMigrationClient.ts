import { asUser, RestClient } from '@ministryofjustice/hmpps-rest-client'
import config from '../config'
import logger from '../../logger'
import { AllocationsMigrationFilter, MigrationContextAllocationsMigrationFilter } from '../@types/migration'
import { Context } from '../services/nomisMigrationService'

export default class AllocationsNomisMigrationClient extends RestClient {
  constructor() {
    super('Appointments Nomis MigrationHistory API Client', config.apis.nomisMigration, logger)
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
      asUser(context.token),
    )
  }
}
