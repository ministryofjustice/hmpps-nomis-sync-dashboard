import querystring from 'querystring'
import { asSystem, RestClient } from '@ministryofjustice/hmpps-rest-client'
import { AuthenticationClient } from '@ministryofjustice/hmpps-auth-clients'

import config from '../config'
import logger from '../../logger'
import { GetContactPersonByFilter, PagePersonIdResponse } from '../@types/nomisPrisoner'
import { Context } from '../services/context'

export default class ContactPersonNomisPrisonerClient extends RestClient {
  constructor(authenticationClient: AuthenticationClient) {
    super('Contact Person Nomis Prisoner API Client', config.apis.nomisPrisoner, logger, authenticationClient)
  }

  async getMigrationEstimatedCount(filter: GetContactPersonByFilter, context: Context): Promise<number> {
    logger.info(`getting details for migration estimated count`)
    const response = await this.get<PagePersonIdResponse>(
      {
        path: `/persons/ids`,
        query: `${querystring.stringify({ ...filter, size: 1 })}`,
      },
      asSystem(context.username),
    )
    return response.totalElements
  }
}
