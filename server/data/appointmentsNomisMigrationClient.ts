import { asSystem, RestClient } from '@ministryofjustice/hmpps-rest-client'
import { AuthenticationClient } from '@ministryofjustice/hmpps-auth-clients'
import config from '../config'
import logger from '../../logger'
import { AppointmentsMigrationFilter, MigrationContextAppointmentsMigrationFilter } from '../@types/migration'
import { Context } from '../services/context'

export default class AppointmentsNomisMigrationClient extends RestClient {
  constructor(authenticationClient: AuthenticationClient) {
    super('Appointments Nomis MigrationHistory API Client', config.apis.nomisMigration, logger, authenticationClient)
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
      asSystem(context.username),
    )
  }
}
