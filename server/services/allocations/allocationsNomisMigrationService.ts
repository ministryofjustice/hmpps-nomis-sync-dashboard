import { AllocationsMigrationFilter, MigrationContextAllocationsMigrationFilter } from '../../@types/migration'

import RestClient from '../../data/restClient'
import config from '../../config'
import logger from '../../../logger'
import { Context } from '../nomisMigrationService'

export default class AllocationsNomisMigrationService {
  constructor() {}

  private static restClient(token: string): RestClient {
    return new RestClient('Appointments Nomis MigrationHistory API Client', config.apis.nomisMigration, token)
  }

  async startAllocationsMigration(
    filter: AllocationsMigrationFilter,
    context: Context,
  ): Promise<MigrationContextAllocationsMigrationFilter> {
    logger.info(`starting an allocations migration`)
    return AllocationsNomisMigrationService.restClient(context.token).post<MigrationContextAllocationsMigrationFilter>({
      path: `/migrate/allocations`,
      data: filter,
    })
  }
}
