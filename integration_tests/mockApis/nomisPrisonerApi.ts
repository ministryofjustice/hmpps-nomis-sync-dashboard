import { SuperAgentRequest } from 'superagent'
import { stubFor } from './wiremock'

const stubNomisPrisonerPing = (): SuperAgentRequest =>
  stubFor({
    request: {
      method: 'GET',
      urlPattern: '/nomis-prisoner-api/health/ping',
    },
    response: {
      status: 200,
      headers: { 'Content-Type': 'application/json;charset=UTF-8' },
      jsonBody: { status: 'UP' },
    },
  })

const stubGetVisitMigrationEstimatedCount = (count: number): SuperAgentRequest =>
  stubFor({
    request: {
      method: 'GET',
      urlPath: '/nomis-prisoner-api/visits/ids',
    },
    response: {
      status: 200,
      headers: { 'Content-Type': 'application/json;charset=UTF-8' },
      jsonBody: {
        content: [
          {
            visitId: 180935,
          },
        ],
        pageable: {
          sort: {
            empty: false,
            sorted: true,
            unsorted: false,
          },
          offset: 0,
          pageSize: 1,
          pageNumber: 0,
          paged: true,
          unpaged: false,
        },
        last: false,
        totalPages: count,
        totalElements: count,
        size: 1,
        number: 0,
        sort: {
          empty: false,
          sorted: true,
          unsorted: false,
        },
        first: true,
        numberOfElements: 1,
        empty: false,
      },
    },
  })

const stubGetVisitMigrationRoomUsage = (): SuperAgentRequest =>
  stubFor({
    request: {
      method: 'GET',
      urlPath: '/nomis-prisoner-api/visits/rooms/usage-count',
    },
    response: {
      status: 200,
      headers: { 'Content-Type': 'application/json;charset=UTF-8' },
      jsonBody: [
        {
          agencyInternalLocationDescription: 'AGI-VISITS-OFF_VIS',
          count: 95,
        },
        {
          agencyInternalLocationDescription: 'AGI-VISITS-SOC_VIS',
          count: 14314,
        },
        {
          agencyInternalLocationDescription: 'AKI-VISITS-3RD SECTOR',
          count: 390,
        },
      ],
    },
  })

export default {
  stubNomisPrisonerPing,
  stubGetVisitMigrationEstimatedCount,
  stubGetVisitMigrationRoomUsage,
}
