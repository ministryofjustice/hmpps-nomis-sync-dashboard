import { Context } from '../context'
import OfficialvisitsNomisPrisonerClient from '../../data/officialvisitsNomisPrisonerClient'
import { OfficialVisitsMigrationFilter } from '../../@types/migration'

export default class OfficialvisitsNomisPrisonerService {
  constructor(private readonly officialvisitsNomisPrisonerClient: OfficialvisitsNomisPrisonerClient) {}

  async getMigrationEstimatedCount(filter: OfficialVisitsMigrationFilter, context: Context): Promise<number> {
    return this.officialvisitsNomisPrisonerClient.getMigrationEstimatedCount(filter, context)
  }
}
