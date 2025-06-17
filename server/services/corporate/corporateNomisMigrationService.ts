import { CorporateMigrationFilter, MigrationContextCorporateMigrationFilter } from '../../@types/migration'

import { Context } from '../context'
import CorporateNomisMigrationClient from '../../data/corporateNomisMigrationClient'

export default class CorporateNomisMigrationService {
  constructor(private readonly corporateNomisMigrationClient: CorporateNomisMigrationClient) {}

  async startMigration(
    filter: CorporateMigrationFilter,
    context: Context,
  ): Promise<MigrationContextCorporateMigrationFilter> {
    return this.corporateNomisMigrationClient.startMigration(filter, context)
  }
}
