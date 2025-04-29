import querystring from 'querystring'
import { asSystem, RestClient } from '@ministryofjustice/hmpps-rest-client'
import { AuthenticationClient } from '@ministryofjustice/hmpps-auth-clients'
import config from '../config'
import logger from '../../logger'
import { Context } from '../services/nomisMigrationService'
import { PagePrisonerId } from '../@types/nomisPrisoner'

export default class ContactPersonProfileDetailsNomisPrisonerClient extends RestClient {
  constructor(authenticationClient: AuthenticationClient) {
    super(
      'Contact Person Profile Details Nomis Prisoner API Client',
      config.apis.nomisPrisoner,
      logger,
      authenticationClient,
    )
  }

  async getMigrationEstimatedCount(context: Context): Promise<number> {
    logger.info(`getting details for contact person profile details migration estimated count`)
    const response = await this.get<PagePrisonerId>(
      {
        path: `/prisoners/ids/all`,
        query: `${querystring.stringify({ size: 1 })}`,
      },
      asSystem(context.username),
    )
    return response.totalElements
  }
}
