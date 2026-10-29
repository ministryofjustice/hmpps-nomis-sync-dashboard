import { Context } from '../context'
import ScheduledPaymentsNomisPrisonerClient from '../../data/scheduledPaymentsNomisPrisonerClient'

export default class ScheduledPaymentsNomisPrisonerService {
  constructor(private readonly scheduledPaymentsNomisPrisonerClient: ScheduledPaymentsNomisPrisonerClient) {}

  async getMigrationEstimatedCount(context: Context): Promise<number> {
    return this.scheduledPaymentsNomisPrisonerClient.getMigrationEstimatedCount(context)
  }
}
