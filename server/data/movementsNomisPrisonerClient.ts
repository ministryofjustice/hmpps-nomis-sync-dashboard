import { asSystem, RestClient } from '@ministryofjustice/hmpps-rest-client'
import { AuthenticationClient } from '@ministryofjustice/hmpps-auth-clients'

import config from '../config'
import logger from '../../logger'
import { Context } from '../services/context'
import { PagePrisonerId } from '../@types/nomisPrisoner'

export default class MovementsNomisPrisonerClient extends RestClient {
  constructor(authenticationClient: AuthenticationClient) {
    super('Movements Nomis Prisoner API Client', config.apis.nomisPrisoner, logger, authenticationClient)
  }

  async getMigrationEstimatedCount(context: Context): Promise<number> {
    logger.info(`getting details for movements migration estimated count`)
    const response = await this.get<PagePrisonerId>(
      {
        path: `/prisoners/ids/all`,
        query: { size: 1 },
      },
      asSystem(context.username),
    )
    return response.totalElements
  }
}
