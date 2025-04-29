import { asUser, RestClient } from '@ministryofjustice/hmpps-rest-client'
import config from '../config'
import logger from '../../logger'
import { ActivitiesMigrationFilter, MigrationContextActivitiesMigrationFilter } from '../@types/migration'
import { Context } from '../services/context'

export default class ActivitiesNomisMigrationClient extends RestClient {
  constructor() {
    super('Activities Nomis MigrationHistory API Client', config.apis.nomisMigration, logger)
  }

  async startActivitiesMigration(
    filter: ActivitiesMigrationFilter,
    context: Context,
  ): Promise<MigrationContextActivitiesMigrationFilter> {
    logger.info(`starting an activities migration`)
    return this.post<MigrationContextActivitiesMigrationFilter>(
      {
        path: `/migrate/activities`,
        data: filter,
      },
      asUser(context.token),
    )
  }

  async endMigratedActivities(context: Context, migrationId: string): Promise<string> {
    logger.info(`Ending NOMIS activities for migrationId=${migrationId}`)
    try {
      await this.put<void>(
        {
          path: `/migrate/activities/${migrationId}/end`,
        },
        asUser(context.token),
      )
    } catch (e) {
      switch (e.responseStatus) {
        case 404:
          return 'Not found'
        default:
          return 'Error'
      }
    }
    return 'OK'
  }
}
