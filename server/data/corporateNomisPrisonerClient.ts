import { asSystem, RestClient } from '@ministryofjustice/hmpps-rest-client'
import { AuthenticationClient } from '@ministryofjustice/hmpps-auth-clients'

import config from '../config'
import logger from '../../logger'
import { Context } from '../services/context'
import { GetContactPersonByFilter, PageCorporateOrganisationIdResponse } from '../@types/nomisPrisoner'

export default class CorporateNomisPrisonerClient extends RestClient {
  constructor(authenticationClient: AuthenticationClient) {
    super('Corporate Nomis Prisoner API Client', config.apis.nomisPrisoner, logger, authenticationClient)
  }

  async getMigrationEstimatedCount(filter: GetContactPersonByFilter, context: Context): Promise<number> {
    logger.info(`getting details for migration estimated count`)
    const response = await this.get<PageCorporateOrganisationIdResponse>(
      {
        path: `/corporates/ids`,
        query: { ...filter, size: 1 },
      },
      asSystem(context.username),
    )
    return response.totalElements
  }
}
