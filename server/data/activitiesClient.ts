import { asSystem, RestClient, SanitisedError } from '@ministryofjustice/hmpps-rest-client'
import { AuthenticationClient } from '@ministryofjustice/hmpps-auth-clients'
import config from '../config'
import logger from '../../logger'
import { PrisonPayBand, RolloutPrisonPlan } from '../@types/activities'
import { Context } from '../services/context'

export default class ActivitiesClient extends RestClient {
  constructor(authenticationClient: AuthenticationClient) {
    super('Activities API Client', config.apis.activities, logger, authenticationClient)
  }

  async getRolloutPrison(prisonId: string, context: Context): Promise<RolloutPrisonPlan> {
    return this.get<RolloutPrisonPlan>(
      {
        path: `/rollout/${prisonId}`,
      },
      asSystem(context.username),
    )
  }

  async checkPrisonPayBandsExist(prisonId: string, context: Context): Promise<boolean> {
    const payBands = await this.get<PrisonPayBand[]>(
      {
        path: `/prison/${prisonId}/prison-pay-bands`,
      },
      asSystem(context.username),
    )
    return payBands.length > 0
  }

  async checkPrisonRegimeExists(prisonId: string, context: Context): Promise<boolean> {
    return this.get<PrisonPayBand[] | null>(
      {
        path: `/prison/prison-regime/${prisonId}`,
        errorHandler: this.handleNotFoundError,
      },
      asSystem(context.username),
    ).then(result => result !== null)
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
