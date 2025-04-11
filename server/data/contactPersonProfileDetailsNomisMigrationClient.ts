import { asUser, RestClient } from '@ministryofjustice/hmpps-rest-client'
import config from '../config'
import logger from '../../logger'
import {
  ContactPersonProfileDetailsMigrationFilter,
  MigrationContextContactPersonProfileDetailsMigrationFilter,
} from '../@types/migration'
import { Context } from '../services/nomisMigrationService'

export default class ContactPersonProfileDetailsNomisMigrationClient extends RestClient {
  constructor() {
    super('Contact Person Profile Details Nomis MigrationHistory API Client', config.apis.nomisMigration, logger)
  }

  async startMigration(
    filter: ContactPersonProfileDetailsMigrationFilter,
    context: Context,
  ): Promise<MigrationContextContactPersonProfileDetailsMigrationFilter> {
    logger.info(`starting a migration`)
    return this.post<MigrationContextContactPersonProfileDetailsMigrationFilter>(
      {
        path: `/migrate/contact-person-profile-details`,
        data: filter,
      },
      asUser(context.token),
    )
  }
}
