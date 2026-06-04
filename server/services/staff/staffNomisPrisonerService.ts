import { Context } from '../context'
import StaffNomisPrisonerClient from '../../data/staffNomisPrisonerClient'

export default class StaffNomisPrisonerService {
  constructor(private readonly staffNomisPrisonerClient: StaffNomisPrisonerClient) {}

  async getMigrationEstimatedCount(context: Context): Promise<number> {
    return this.staffNomisPrisonerClient.getMigrationEstimatedCount(context)
  }
}
