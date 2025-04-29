import { AllocationsMigrationFilter, MigrationContextAllocationsMigrationFilter } from '../../@types/migration'

import { Context } from '../context'
import AllocationsNomisMigrationClient from '../../data/allocationsNomisMigrationClient'

export default class AllocationsNomisMigrationService {
  constructor(private readonly allocationsNomisMigrationClient: AllocationsNomisMigrationClient) {}

  async startAllocationsMigration(
    filter: AllocationsMigrationFilter,
    context: Context,
  ): Promise<MigrationContextAllocationsMigrationFilter> {
    return this.allocationsNomisMigrationClient.startAllocationsMigration(filter, context)
  }
}
