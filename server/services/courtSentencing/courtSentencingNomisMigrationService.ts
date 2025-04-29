import { CourtSentencingMigrationFilter, MigrationContextCourtSentencingMigrationFilter } from '../../@types/migration'

import { Context } from '../context'
import CourtSentencingNomisMigrationClient from '../../data/courtSentencingNomisMigrationClient'

export default class CourtSentencingNomisMigrationService {
  constructor(private readonly courtSentencingNomisMigrationClient: CourtSentencingNomisMigrationClient) {}

  async startCourtSentencingMigration(
    filter: CourtSentencingMigrationFilter,
    context: Context,
  ): Promise<MigrationContextCourtSentencingMigrationFilter> {
    return this.courtSentencingNomisMigrationClient.startCourtSentencingMigration(filter, context)
  }
}
