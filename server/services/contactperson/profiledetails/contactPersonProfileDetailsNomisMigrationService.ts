import {
  ContactPersonProfileDetailsMigrationFilter,
  MigrationContextContactPersonProfileDetailsMigrationFilter,
} from '../../../@types/migration'

import RestClient from '../../../data/restClient'
import config from '../../../config'
import logger from '../../../../logger'
import { Context } from '../../nomisMigrationService'

export default class ContactPersonProfileDetailsNomisMigrationService {
  constructor() {}

  private static restClient(token: string): RestClient {
    return new RestClient(
      'Contact Person Profile Details Nomis MigrationHistory API Client',
      config.apis.nomisMigration,
      token,
    )
  }

  async startMigration(
    filter: ContactPersonProfileDetailsMigrationFilter,
    context: Context,
  ): Promise<MigrationContextContactPersonProfileDetailsMigrationFilter> {
    logger.info(`starting a migration`)
    return ContactPersonProfileDetailsNomisMigrationService.restClient(
      context.token,
    ).post<MigrationContextContactPersonProfileDetailsMigrationFilter>({
      path: `/migrate/contact-person-profile-details`,
      data: filter,
    })
  }
}
