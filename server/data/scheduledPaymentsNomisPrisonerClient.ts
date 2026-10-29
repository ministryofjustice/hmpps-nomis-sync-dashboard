import { asSystem, RestClient } from '@ministryofjustice/hmpps-rest-client'
import { AuthenticationClient } from '@ministryofjustice/hmpps-auth-clients'
import config from '../config'
import logger from '../../logger'
import { Context } from '../services/context'

interface ActiveCountResponse {
  activeCount: number
}

export default class ScheduledPaymentsNomisPrisonerClient extends RestClient {
  constructor(authenticationClient: AuthenticationClient) {
    super('Scheduled Payments NOMIS Prisoner API Client', config.apis.nomisPrisoner, logger, authenticationClient)
  }

  async getMigrationEstimatedCount(context: Context): Promise<number> {
    logger.info('getting scheduled payments migration estimated count')
    const response = await this.get<ActiveCountResponse>(
      {
        path: '/finance/scheduled-payments/active-count',
      },
      asSystem(context.username),
    )
    return response.activeCount
  }
}
