import { MigrationContextObject } from '../../@types/migration'

import { Context } from '../context'
import VisitslotsNomisMigrationClient from '../../data/visitslotsNomisMigrationClient'

export default class VisitslotsNomisMigrationService {
  constructor(private readonly visitslotsNomisMigrationClient: VisitslotsNomisMigrationClient) {}

  async startMigration(context: Context): Promise<MigrationContextObject> {
    return this.visitslotsNomisMigrationClient.startMigration(context)
  }
}
