import { GetContactPersonByFilter } from '../../@types/nomisPrisoner'
import { Context } from '../nomisMigrationService'
import CorporateNomisPrisonerClient from '../../data/corporateNomisPrisonerClient'

export default class CorporateNomisPrisonerService {
  constructor(private readonly corporateNomisPrisonerClient: CorporateNomisPrisonerClient) {}

  async getMigrationEstimatedCount(filter: GetContactPersonByFilter, context: Context): Promise<number> {
    return this.corporateNomisPrisonerClient.getMigrationEstimatedCount(filter, context)
  }
}
