import { PrisonerFilteredMigrationForm } from 'express-session'
import { Context } from '../context'
import MovementsNomisPrisonerClient from '../../data/movementsNomisPrisonerClient'

export default class MovementsNomisPrisonerService {
  constructor(private readonly movementsNomisPrisonerClient: MovementsNomisPrisonerClient) {}

  async getMigrationEstimatedCount(filter: PrisonerFilteredMigrationForm, context: Context): Promise<number> {
    if (filter.prisonerNumber) {
      return Promise.resolve(1)
    }
    return this.movementsNomisPrisonerClient.getMigrationEstimatedCount(context)
  }
}
