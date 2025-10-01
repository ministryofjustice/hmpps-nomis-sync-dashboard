import { AuthenticationClient } from '@ministryofjustice/hmpps-auth-clients'
import { asSystem, RestClient } from '@ministryofjustice/hmpps-rest-client'

import config from '../config'
import logger from '../../logger'
import { Context } from '../services/context'
import { GetPrisonerBalanceIdsByFilter, PagedModelLong } from '../@types/nomisPrisoner'

export default class PrisonerBalanceNomisPrisonerClient extends RestClient {
  constructor(authenticationClient: AuthenticationClient) {
    super('Prisoner Balance Nomis Prisoner API Client', config.apis.nomisPrisoner, logger, authenticationClient)
  }

  async getMigrationEstimatedCount(filter: GetPrisonerBalanceIdsByFilter, context: Context): Promise<number> {
    logger.info(`getting details for migration estimated count`)
    const response = await this.get<PagedModelLong>(
      {
        path: `/finance/prisoners/ids`,
        query: { ...filter, size: 1 },
      },
      asSystem(context.username),
    )
    return response.page.totalElements
  }
}
