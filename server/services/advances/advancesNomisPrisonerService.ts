import { Context } from '../context'
import AdvancesNomisPrisonerClient from '../../data/advancesNomisPrisonerClient'

export default class AdvancesNomisPrisonerService {
  constructor(private readonly advancesNomisPrisonerClient: AdvancesNomisPrisonerClient) {}

  async getMigrationEstimatedCount(context: Context): Promise<number> {
    return this.advancesNomisPrisonerClient.getMigrationEstimatedCount(context)
  }
}
