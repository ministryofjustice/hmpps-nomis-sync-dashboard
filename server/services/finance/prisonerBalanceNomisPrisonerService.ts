import { GetPrisonerBalanceIdsByFilter } from '../../@types/nomisPrisoner'
import { Context } from '../context'
import PrisonerBalanceNomisPrisonerClient from '../../data/prisonerBalanceNomisPrisonerClient'

export default class PrisonerBalanceNomisPrisonerService {
  constructor(private readonly prisonerBalanceNomisPrisonerClient: PrisonerBalanceNomisPrisonerClient) {}

  async getMigrationEstimatedCount(filter: GetPrisonerBalanceIdsByFilter, context: Context): Promise<number> {
    return this.prisonerBalanceNomisPrisonerClient.getMigrationEstimatedCount(filter, context)
  }
}
