import { MigrationContextObject } from '../../@types/migration'

import { Context } from '../context'
import StaffNomisMigrationClient from '../../data/staffNomisMigrationClient'

export default class StaffNomisMigrationService {
  constructor(private readonly staffNomisMigrationClient: StaffNomisMigrationClient) {}

  async startMigration(context: Context): Promise<MigrationContextObject> {
    return this.staffNomisMigrationClient.startMigration(context)
  }
}
