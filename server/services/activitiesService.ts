import RestClient from '../data/restClient'
import config from '../config'
import { Context } from './nomisMigrationService'
import { PrisonPayBand, RolloutPrisonPlan } from '../@types/activities'

export default class ActivitiesService {
  private static restClient(token: string): RestClient {
    return new RestClient('Activities API Client', config.apis.activities, token)
  }

  async getRolloutPrison(prisonId: string, context: Context): Promise<RolloutPrisonPlan> {
    return ActivitiesService.restClient(context.token).get<RolloutPrisonPlan>({
      path: `/rollout/${prisonId}`,
    })
  }

  async checkPrisonPayBandsExist(prisonId: string, context: Context): Promise<boolean> {
    const payBands = await ActivitiesService.restClient(context.token).get<PrisonPayBand[]>({
      path: `/prison/${prisonId}/prison-pay-bands`,
    })
    return payBands.length > 0
  }

  async checkPrisonRegimeExists(prisonId: string, context: Context): Promise<boolean> {
    try {
      await ActivitiesService.restClient(context.token).get<PrisonPayBand[]>({
        path: `/prison/prison-regime/${prisonId}`,
      })
    } catch (error) {
      if (error.status === 404) {
        return false
      }
      throw error
    }
    return true
  }
}
