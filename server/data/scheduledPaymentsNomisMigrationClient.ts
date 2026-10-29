import { asSystem, RestClient } from '@ministryofjustice/hmpps-rest-client'
import { AuthenticationClient } from '@ministryofjustice/hmpps-auth-clients'
import config from '../config'
import logger from '../../logger'
import { MigrationContextObject } from '../@types/migration'
import { Context } from '../services/context'

export default class ScheduledPaymentsNomisMigrationClient extends RestClient {
  constructor(authenticationClient: AuthenticationClient) {
    super('Scheduled Payments NOMIS Migration API Client', config.apis.nomisMigration, logger, authenticationClient)
  }

  async startMigration(context: Context): Promise<MigrationContextObject> {
    logger.info('starting a scheduled payments migration')
    return this.post<MigrationContextObject>(
      {
        path: '/migrate/scheduled-payments',
      },
      asSystem(context.username),
    )
  }
}
