import RestClient from '../data/restClient'
import config from '../config'
import { Context } from './nomisMigrationService'
import { PrisonPayBand, RolloutPrisonPlan } from '../@types/activities'
import { HmppsAuthClient } from '../data'

export default class ActivitiesService {
  constructor(private readonly hmppsAuthClient: HmppsAuthClient) {}

  private static restClient(token: string): RestClient {
    return new RestClient('Activities API Client', config.apis.activities, token)
  }

  async getRolloutPrison(prisonId: string, context: Context): Promise<RolloutPrisonPlan> {
    const token = await this.hmppsAuthClient.getSystemClientToken(context.username)
    return ActivitiesService.restClient(token).get<RolloutPrisonPlan>({
      path: `/rollout/${prisonId}`,
    })
  }

  async checkPrisonPayBandsExist(prisonId: string, context: Context): Promise<boolean> {
    const token = await this.hmppsAuthClient.getSystemClientToken(context.username)
    const payBands = await ActivitiesService.restClient(token).get<PrisonPayBand[]>({
      path: `/prison/${prisonId}/prison-pay-bands`,
    })
    return payBands.length > 0
  }

  async checkPrisonRegimeExists(prisonId: string, context: Context): Promise<boolean> {
    const token = await this.hmppsAuthClient.getSystemClientToken(context.username)
    try {
      await ActivitiesService.restClient(token).get<PrisonPayBand[]>({
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

  async getActivityCategories(context: Context): Promise<string[]> {
    const token = await this.hmppsAuthClient.getSystemClientToken(context.username)
    return ActivitiesService.restClient(token).get<string[]>({
      path: `/activity-categories`,
    })
  }
}
