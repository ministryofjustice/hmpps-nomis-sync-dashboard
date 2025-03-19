import querystring from 'querystring'
import RestClient from '../../../data/restClient'
import config from '../../../config'
import { PagePrisonerId } from '../../../@types/nomisPrisoner'
import logger from '../../../../logger'
import { Context } from '../../nomisMigrationService'
import type HmppsAuthClient from '../../../data/hmppsAuthClient'

export default class ContactPersonProfileDetailsNomisPrisonerService {
  constructor(private readonly hmppsAuthClient: HmppsAuthClient) {}

  private static restClient(token: string): RestClient {
    return new RestClient('Contact Person Profile Details Nomis Prisoner API Client', config.apis.nomisPrisoner, token)
  }

  async getMigrationEstimatedCount(context: Context): Promise<number> {
    const token = await this.hmppsAuthClient.getSystemClientToken(context.username)
    logger.info(`getting details for contact person profile details migration estimated count`)
    const response = await ContactPersonProfileDetailsNomisPrisonerService.restClient(token).get<PagePrisonerId>({
      path: `/prisoners/ids/all`,
      query: `${querystring.stringify({ size: 1 })}`,
    })
    return response.totalElements
  }
}
