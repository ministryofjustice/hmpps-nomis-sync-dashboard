import { asUser, RestClient } from '@ministryofjustice/hmpps-rest-client'
import config from '../config'
import logger from '../../logger'
import { Context } from '../services/context'
import { MigrationContextPrisonerBalanceMigrationFilter, PrisonerBalanceMigrationFilter } from '../@types/migration'

export default class PrisonerBalanceNomisMigrationClient extends RestClient {
  constructor() {
    super('Prisoner Balance Nomis Migration History API Client', config.apis.nomisMigration, logger)
  }

  async startMigration(
    filter: PrisonerBalanceMigrationFilter,
    context: Context,
  ): Promise<MigrationContextPrisonerBalanceMigrationFilter> {
    logger.info(`starting a migration`)
    return this.post<MigrationContextPrisonerBalanceMigrationFilter>(
      {
        path: `/migrate/prisoner-balance`,
        data: filter,
      },
      asUser(context.token),
    )
  }
}
