import { asSystem, RestClient } from '@ministryofjustice/hmpps-rest-client'
import { AuthenticationClient } from '@ministryofjustice/hmpps-auth-clients'

import config from '../config'
import logger from '../../logger'
import { Context } from '../services/context'

interface ActiveCountResponse {
  activeCount: number
}

export default class AdvancesNomisPrisonerClient extends RestClient {
  constructor(authenticationClient: AuthenticationClient) {
    super('Prisoner Advances NOMIS Prisoner API Client', config.apis.nomisPrisoner, logger, authenticationClient)
  }

  async getMigrationEstimatedCount(context: Context): Promise<number> {
    logger.info('getting prisoner advances migration estimated count')
    const response = await this.get<ActiveCountResponse>(
      {
        path: '/finance/prisoners/advances/active-count',
      },
      asSystem(context.username),
    )
    return response.activeCount
  }
}
