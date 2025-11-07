import { asSystem, RestClient } from '@ministryofjustice/hmpps-rest-client'
import { AuthenticationClient } from '@ministryofjustice/hmpps-auth-clients'

import config from '../config'
import logger from '../../logger'
import { Context } from '../services/context'
import { PagedModelVisitTimeSlotIdResponse } from '../@types/nomisPrisoner'

export default class VisitslotsNomisPrisonerClient extends RestClient {
  constructor(authenticationClient: AuthenticationClient) {
    super('Visit Slots Nomis Prisoner API Client', config.apis.nomisPrisoner, logger, authenticationClient)
  }

  async getMigrationEstimatedCount(context: Context): Promise<number> {
    logger.info(`getting details for migration estimated count`)
    const response = await this.get<PagedModelVisitTimeSlotIdResponse>(
      {
        path: `/visits/configuration/time-slots/ids`,
        query: { size: 1 },
      },
      asSystem(context.username),
    )
    return response.page.totalElements
  }
}
