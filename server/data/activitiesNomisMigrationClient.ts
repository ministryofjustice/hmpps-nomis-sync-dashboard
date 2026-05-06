import { asSystem, RestClient, SanitisedError } from '@ministryofjustice/hmpps-rest-client'
import { AuthenticationClient } from '@ministryofjustice/hmpps-auth-clients'
import config from '../config'
import logger from '../../logger'
import { ActivitiesMigrationFilter, MigrationContextActivitiesMigrationFilter } from '../@types/migration'
import { Context } from '../services/context'

export default class ActivitiesNomisMigrationClient extends RestClient {
  constructor(authenticationClient: AuthenticationClient) {
    super('Activities Nomis MigrationHistory API Client', config.apis.nomisMigration, logger, authenticationClient)
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
      asSystem(context.username),
    )
  }

  async endMigratedActivities(context: Context, migrationId: string): Promise<string> {
    logger.info(`Ending NOMIS activities for migrationId=${migrationId}`)
    return this.put<void | null>(
      {
        path: `/migrate/activities/${migrationId}/end`,
        errorHandler: this.handleNotFoundError,
      },
      asSystem(context.username),
    )
      .then(result => (result !== null ? 'OK' : 'Not found'))
      .catch(_reason => 'Error')
  }

  async moveStartDate(context: Context, migrationId: string, newActivityStartDate: string): Promise<string[]> {
    logger.info(`Moving activities start date to ${newActivityStartDate} for migrationId=${migrationId}`)
    return this.put<string[]>(
      {
        path: `/migrate/activities/${migrationId}/move-start-dates`,
        data: { newActivityStartDate },
      },
      asSystem(context.username),
    )
  }

  private handleNotFoundError<Response, ErrorData>(
    path: string,
    method: string,
    error: SanitisedError<ErrorData>,
  ): Response | null {
    if (error.responseStatus === 404) {
      logger.info(`Returned null for 404 not found when calling ${this.name}: ${path}`)
      return null
    }
    return this.handleError<Response, ErrorData>(path, method, error)
  }
}
