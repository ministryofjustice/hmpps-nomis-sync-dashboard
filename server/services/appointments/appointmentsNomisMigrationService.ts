import { AppointmentsMigrationFilter, MigrationContextAppointmentsMigrationFilter } from '../../@types/migration'

import { Context } from '../context'
import AppointmentsNomisMigrationClient from '../../data/appointmentsNomisMigrationClient'

export default class AppointmentsNomisMigrationService {
  constructor(private readonly appointmentsNomisMigrationClient: AppointmentsNomisMigrationClient) {}

  async startAppointmentsMigration(
    filter: AppointmentsMigrationFilter,
    context: Context,
  ): Promise<MigrationContextAppointmentsMigrationFilter> {
    return this.appointmentsNomisMigrationClient.startAppointmentsMigration(filter, context)
  }
}
