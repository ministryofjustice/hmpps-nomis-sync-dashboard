import { MigrationContextObject } from '../../@types/migration'

import { Context } from '../context'
import AdvancesNomisMigrationClient from '../../data/advancesNomisMigrationClient'

export default class AdvancesNomisMigrationService {
  constructor(private readonly advancesNomisMigrationClient: AdvancesNomisMigrationClient) {}

  async startMigration(context: Context): Promise<MigrationContextObject> {
    return this.advancesNomisMigrationClient.startMigration(context)
  }
}
