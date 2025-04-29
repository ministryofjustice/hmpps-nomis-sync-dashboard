import { GetVisitBalanceIdsByFilter } from '../../@types/nomisPrisoner'
import { Context } from '../context'
import VisitBalanceNomisPrisonerClient from '../../data/visitBalanceNomisPrisonerClient'

export default class VisitBalanceNomisPrisonerService {
  constructor(private readonly visitBalanceNomisPrisonerClient: VisitBalanceNomisPrisonerClient) {}

  async getMigrationEstimatedCount(filter: GetVisitBalanceIdsByFilter, context: Context): Promise<number> {
    return this.visitBalanceNomisPrisonerClient.getMigrationEstimatedCount(filter, context)
  }
}
