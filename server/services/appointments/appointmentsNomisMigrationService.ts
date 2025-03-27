import { AppointmentsMigrationFilter, MigrationContextAppointmentsMigrationFilter } from '../../@types/migration'

import RestClient from '../../data/restClient'
import config from '../../config'
import logger from '../../../logger'
import { Context } from '../nomisMigrationService'

export default class AppointmentsNomisMigrationService {
  constructor() {}

  private static restClient(token: string): RestClient {
    return new RestClient('Appointments Nomis MigrationHistory API Client', config.apis.nomisMigration, token)
  }

  async startAppointmentsMigration(
    filter: AppointmentsMigrationFilter,
    context: Context,
  ): Promise<MigrationContextAppointmentsMigrationFilter> {
    logger.info(`starting a appointments migration`)
    return AppointmentsNomisMigrationService.restClient(
      context.token,
    ).post<MigrationContextAppointmentsMigrationFilter>({
      path: `/migrate/appointments`,
      data: filter,
    })
  }
}
