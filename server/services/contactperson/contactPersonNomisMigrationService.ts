import { ContactPersonMigrationFilter, MigrationContextContactPersonMigrationFilter } from '../../@types/migration'

import { Context } from '../context'
import ContactPersonNomisMigrationClient from '../../data/contactPersonNomisMigrationClient'

export default class ContactPersonNomisMigrationService {
  constructor(private readonly contactPersonNomisMigrationClient: ContactPersonNomisMigrationClient) {}

  async startMigration(
    filter: ContactPersonMigrationFilter,
    context: Context,
  ): Promise<MigrationContextContactPersonMigrationFilter> {
    return this.contactPersonNomisMigrationClient.startMigration(filter, context)
  }
}
