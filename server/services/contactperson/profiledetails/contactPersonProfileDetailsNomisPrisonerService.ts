import { Context } from '../../../data/nomisMigrationClient'
import ContactPersonProfileDetailsNomisPrisonerClient from '../../../data/contactPersonProfileDetailsNomisPrisonerClient'

export default class ContactPersonProfileDetailsNomisPrisonerService {
  constructor(
    private readonly contactPersonProfileDetailsNomisPrisonerClient: ContactPersonProfileDetailsNomisPrisonerClient,
  ) {}

  async getMigrationEstimatedCount(context: Context): Promise<number> {
    return this.contactPersonProfileDetailsNomisPrisonerClient.getMigrationEstimatedCount(context)
  }
}
