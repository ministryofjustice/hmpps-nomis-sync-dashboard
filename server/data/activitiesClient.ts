import { asSystem, RestClient } from '@ministryofjustice/hmpps-rest-client'
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
    try {
      await this.get<PrisonPayBand[]>(
        {
          path: `/prison/prison-regime/${prisonId}`,
        },
        asSystem(context.username),
      )
    } catch (error) {
      if (error.responseStatus === 404) {
        return false
      }
      throw error
    }
    return true
  }
}
