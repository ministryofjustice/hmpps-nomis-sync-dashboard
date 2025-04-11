import {
  ContactPersonProfileDetailsMigrationFilter,
  MigrationContextContactPersonProfileDetailsMigrationFilter,
} from '../../../@types/migration'

import { Context } from '../../nomisMigrationService'
import ContactPersonProfileDetailsNomisMigrationClient from '../../../data/contactPersonProfileDetailsNomisMigrationClient'

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
