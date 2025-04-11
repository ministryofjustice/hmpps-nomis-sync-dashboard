import { asUser, RestClient } from '@ministryofjustice/hmpps-rest-client'
import config from '../config'
import logger from '../../logger'
import { AppointmentsMigrationFilter, MigrationContextAppointmentsMigrationFilter } from '../@types/migration'
import { Context } from '../services/nomisMigrationService'

export default class AppointmentsNomisMigrationClient extends RestClient {
  constructor() {
    super('Appointments Nomis MigrationHistory API Client', config.apis.nomisMigration, logger)
  }

  async startAppointmentsMigration(
    filter: AppointmentsMigrationFilter,
    context: Context,
  ): Promise<MigrationContextAppointmentsMigrationFilter> {
    logger.info(`starting a appointments migration`)
    return this.post<MigrationContextAppointmentsMigrationFilter>(
      {
        path: `/migrate/appointments`,
        data: filter,
      },
      asUser(context.token),
    )
  }
}
