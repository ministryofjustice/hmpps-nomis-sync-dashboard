import { Context } from './context'
import { RolloutPrisonPlan } from '../@types/activities'
import ActivitiesClient from '../data/activitiesClient'

export default class ActivitiesService {
  constructor(private readonly activitiesClient: ActivitiesClient) {}

  async getRolloutPrison(prisonId: string, context: Context): Promise<RolloutPrisonPlan> {
    return this.activitiesClient.getRolloutPrison(prisonId, context)
  }

  async checkPrisonPayBandsExist(prisonId: string, context: Context): Promise<boolean> {
    return this.activitiesClient.checkPrisonPayBandsExist(prisonId, context)
  }

  async checkPrisonRegimeExists(prisonId: string, context: Context): Promise<boolean> {
    return this.activitiesClient.checkPrisonRegimeExists(prisonId, context)
  }
}
