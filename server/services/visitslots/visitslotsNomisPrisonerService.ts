import { Context } from '../context'
import VisitslotsNomisPrisonerClient from '../../data/visitslotsNomisPrisonerClient'

export default class VisitslotsNomisPrisonerService {
  constructor(private readonly visitslotsNomisPrisonerClient: VisitslotsNomisPrisonerClient) {}

  async getMigrationEstimatedCount(context: Context): Promise<number> {
    return this.visitslotsNomisPrisonerClient.getMigrationEstimatedCount(context)
  }
}
