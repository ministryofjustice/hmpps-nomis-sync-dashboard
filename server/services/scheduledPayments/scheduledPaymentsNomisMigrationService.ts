import { MigrationContextObject } from '../../@types/migration'
import { Context } from '../context'
import ScheduledPaymentsNomisMigrationClient from '../../data/scheduledPaymentsNomisMigrationClient'

export default class ScheduledPaymentsNomisMigrationService {
  constructor(private readonly scheduledPaymentsNomisMigrationClient: ScheduledPaymentsNomisMigrationClient) {}

  async startMigration(context: Context): Promise<MigrationContextObject> {
    return this.scheduledPaymentsNomisMigrationClient.startMigration(context)
  }
}
