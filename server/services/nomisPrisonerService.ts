import querystring from 'querystring'
import RestClient from '../data/restClient'
import config from '../config'
import { GetVisitsByFilter, PageVisitIdResponse } from '../@types/nomisPrisoner'
import logger from '../../logger'
import { Context } from './nomisMigrationService'

export default class NomisPrisonerService {
  private static restClient(token: string): RestClient {
    return new RestClient('Nomis Prisoner API Client', config.apis.nomisPrisoner, token)
  }

  async getVisitMigrationEstimatedCount(filter: GetVisitsByFilter, context: Context): Promise<PageVisitIdResponse> {
    logger.info(`getting details for visit migration  estimated count`)
    const response = await await NomisPrisonerService.restClient(context.token).get<PageVisitIdResponse>({
      path: `/visits/ids`,
      query: `${querystring.stringify({ ...filter, size: 1 })}`,
    })
    return response.totalElements
  }
}
