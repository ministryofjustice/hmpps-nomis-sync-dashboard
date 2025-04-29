import { GetContactPersonByFilter } from '../../@types/nomisPrisoner'
import { Context } from '../context'
import ContactPersonNomisPrisonerClient from '../../data/contactPersonNomisPrisonerClient'

export default class ContactPersonNomisPrisonerService {
  constructor(private readonly contactPersonNomisPrisonerClient: ContactPersonNomisPrisonerClient) {}

  async getMigrationEstimatedCount(filter: GetContactPersonByFilter, context: Context): Promise<number> {
    return this.contactPersonNomisPrisonerClient.getMigrationEstimatedCount(filter, context)
  }
}
