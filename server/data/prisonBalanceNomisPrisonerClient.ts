import { AuthenticationClient } from '@ministryofjustice/hmpps-auth-clients'
import { asSystem, RestClient } from '@ministryofjustice/hmpps-rest-client'

import config from '../config'
import logger from '../../logger'
import { Context } from '../services/context'

export default class PrisonBalanceNomisPrisonerClient extends RestClient {
  constructor(authenticationClient: AuthenticationClient) {
    super('Prison Balance Nomis Prison API Client', config.apis.nomisPrisoner, logger, authenticationClient)
  }

  async getMigrationEstimatedCount(context: Context): Promise<number> {
    logger.info('getting details for migration estimated count')
    const response = await this.get<string[]>(
      {
        path: `/finance/prison/ids`,
      },
      asSystem(context.username),
    )
    return response.length
  }
}
