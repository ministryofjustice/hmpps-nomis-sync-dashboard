import querystring from 'querystring'
import RestClient from '../../data/restClient'
import config from '../../config'
import { GetContactPersonByFilter, PageCorporateOrganisationIdResponse } from '../../@types/nomisPrisoner'
import logger from '../../../logger'
import { Context } from '../nomisMigrationService'
import type HmppsAuthClient from '../../data/hmppsAuthClient'

export default class CorporateNomisPrisonerService {
  constructor(private readonly hmppsAuthClient: HmppsAuthClient) {}

  private static restClient(token: string): RestClient {
    return new RestClient('Corporate Nomis Prisoner API Client', config.apis.nomisPrisoner, token)
  }

  async getMigrationEstimatedCount(filter: GetContactPersonByFilter, context: Context): Promise<number> {
    const token = await this.hmppsAuthClient.getSystemClientToken(context.username)
    logger.info(`getting details for migration estimated count`)
    const response = await CorporateNomisPrisonerService.restClient(token).get<PageCorporateOrganisationIdResponse>({
      path: `/corporates/ids`,
      query: `${querystring.stringify({ ...filter, size: 1 })}`,
    })
    return response.totalElements
  }
}
