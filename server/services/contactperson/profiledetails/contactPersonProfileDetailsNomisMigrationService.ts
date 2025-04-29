import {
  ContactPersonProfileDetailsMigrationFilter,
  MigrationContextContactPersonProfileDetailsMigrationFilter,
} from '../../../@types/migration'

import ContactPersonProfileDetailsNomisMigrationClient from '../../../data/contactPersonProfileDetailsNomisMigrationClient'
import { Context } from '../../context'

export default class ContactPersonProfileDetailsNomisMigrationService {
  constructor(
    private readonly contactPersonProfileDetailsNomisMigrationClient: ContactPersonProfileDetailsNomisMigrationClient,
  ) {}

  async startMigration(
    filter: ContactPersonProfileDetailsMigrationFilter,
    context: Context,
  ): Promise<MigrationContextContactPersonProfileDetailsMigrationFilter> {
    return this.contactPersonProfileDetailsNomisMigrationClient.startMigration(filter, context)
  }
}
