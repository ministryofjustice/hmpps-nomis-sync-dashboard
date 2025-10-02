import { Context } from '../context'
import PrisonBalanceNomisPrisonerClient from '../../data/prisonBalanceNomisPrisonerClient'

export default class PrisonBalanceNomisPrisonService {
  constructor(private readonly prisonBalanceNomisPrisonerClient: PrisonBalanceNomisPrisonerClient) {}

  async getMigrationEstimatedCount(context: Context): Promise<number> {
    return this.prisonBalanceNomisPrisonerClient.getMigrationEstimatedCount(context)
  }
}
