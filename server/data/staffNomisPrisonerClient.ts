import { asSystem, RestClient } from '@ministryofjustice/hmpps-rest-client'
import { AuthenticationClient } from '@ministryofjustice/hmpps-auth-clients'

import config from '../config'
import logger from '../../logger'
import { Context } from '../services/context'
import { PagedModelStaffIdResponse } from '../@types/nomisPrisoner'

export default class StaffNomisPrisonerClient extends RestClient {
  constructor(authenticationClient: AuthenticationClient) {
    super('Staff Nomis Prison API Client', config.apis.nomisPrisoner, logger, authenticationClient)
  }

  async getMigrationEstimatedCount(context: Context): Promise<number> {
    logger.info(`getting details for migration estimated count`)
    const response = await this.get<PagedModelStaffIdResponse>(
      {
        path: `/staff/pageIds`,
        query: { size: 1 },
      },
      asSystem(context.username),
    )
    return response.page?.totalElements || 0
  }
}
