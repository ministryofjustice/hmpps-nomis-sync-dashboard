import { SentencingMigrationFilter, MigrationContextSentencingMigrationFilter } from '../../@types/migration'

import { Context } from '../context'
import SentencingNomisMigrationClient from '../../data/sentencingNomisMigrationClient'

export default class SentencingNomisMigrationService {
  constructor(private readonly sentencingNomisMigrationClient: SentencingNomisMigrationClient) {}

  async startSentencingMigration(
    filter: SentencingMigrationFilter,
    context: Context,
  ): Promise<MigrationContextSentencingMigrationFilter> {
    return this.sentencingNomisMigrationClient.startSentencingMigration(filter, context)
  }
}
