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

const stubGetSentencingMigrationEstimatedCount = (count: number): SuperAgentRequest =>
  stubFor({
    request: {
      method: 'GET',
      urlPath: '/nomis-prisoner-api/adjustments/ids',
    },
    response: {
      status: 200,
      headers: { 'Content-Type': 'application/json;charset=UTF-8' },
      jsonBody: {
        content: [
          {
            bookingId: 180935,
            sequence: 1,
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

const stubGetAppointmentsMigrationEstimatedCount = (count: number): SuperAgentRequest =>
  stubFor({
    request: {
      method: 'GET',
      urlPath: '/nomis-prisoner-api/appointments/ids',
    },
    response: {
      status: 200,
      headers: { 'Content-Type': 'application/json;charset=UTF-8' },
      jsonBody: {
        content: [
          {
            nomisEventId: 180935,
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

const stubGetVisitRoomUsage = (prison: string): SuperAgentRequest =>
  stubFor({
    request: {
      method: 'GET',
      urlPattern: `/nomis-prisoner-api/visits/rooms/usage-count\\?prisonIds=${prison}&visitTypes=SCON&futureVisitsOnly=true`,
    },
    response: {
      status: 200,
      headers: { 'Content-Type': 'application/json;charset=UTF-8' },
      jsonBody: [
        {
          agencyInternalLocationDescription: 'HEI-OPEN-1',
          count: 1,
          prisonId: 'HEI',
        },
        {
          agencyInternalLocationDescription: 'HEI-CLOSED-1',
          count: 37,
          prisonId: 'HEI',
        },
        {
          agencyInternalLocationDescription: 'HEI-OPEN-2',
          count: 1,
          prisonId: 'HEI',
        },
        {
          agencyInternalLocationDescription: 'HEI-CLOSED-2',
          count: 2,
          prisonId: 'HEI',
        },
        {
          agencyInternalLocationDescription: 'HEI-OPEN-3',
          count: 5,
          prisonId: 'HEI',
        },
      ],
    },
  })

const stubCheckServiceAgencySwitch = (): SuperAgentRequest =>
  stubFor({
    request: {
      method: 'GET',
      urlPattern: '/nomis-prisoner-api/service-prisons/ACTIVITY/prison/.*',
    },
    response: {
      status: 204,
    },
  })

const stubPostServiceAgencySwitch = (): SuperAgentRequest =>
  stubFor({
    request: {
      method: 'POST',
      urlPattern: '/nomis-prisoner-api/service-prisons/ACTIVITY/prison/.*',
    },
    response: {
      status: 201,
    },
  })

const stubCheckServiceAgencySwitchNotFound = (): SuperAgentRequest =>
  stubFor({
    request: {
      method: 'GET',
      urlPattern: '/nomis-prisoner-api/service-prisons/ACTIVITY/prison/.*',
    },
    response: {
      status: 404,
    },
    scenarioName: 'Switch not found',
    requiredScenarioState: 'Started',
    newScenarioState: 'Not found',
  })

const stubCheckServiceAgencySwitchAfterNotFound = (): SuperAgentRequest =>
  stubFor({
    request: {
      method: 'GET',
      urlPattern: '/nomis-prisoner-api/service-prisons/ACTIVITY/prison/.*',
    },
    response: {
      status: 204,
    },
    scenarioName: 'Switch not found',
    requiredScenarioState: 'Not found',
  })

const stubCheckServiceAgencySwitchErrors = (): SuperAgentRequest =>
  stubFor({
    request: {
      method: 'GET',
      urlPattern: '/nomis-prisoner-api/service-prisons/ACTIVITY/prison/.*',
    },
    response: {
      status: 504,
    },
  })

const stubGetPrisonIncentiveLevels = (): SuperAgentRequest =>
  stubFor({
    request: {
      method: 'GET',
      urlPattern: `/nomis-prisoner-api/prisons/.*/incentive-levels`,
    },
    response: {
      status: 200,
      headers: { 'Content-Type': 'application/json;charset=UTF-8' },
      jsonBody: [
        {
          code: 'BAS',
          description: 'Basic',
        },
        {
          code: 'STD',
          description: 'Standard',
        },
        {
          code: 'ENH',
          description: 'Enhanced',
        },
      ],
    },
  })

const stubGetPrisonIncentiveLevelsErrors = (): SuperAgentRequest =>
  stubFor({
    request: {
      method: 'GET',
      urlPattern: `/nomis-prisoner-api/prisons/.*/incentive-levels`,
    },
    response: {
      status: 504,
    },
  })

export default {
  stubNomisPrisonerPing,
  stubGetVisitMigrationEstimatedCount,
  stubGetSentencingMigrationEstimatedCount,
  stubGetAppointmentsMigrationEstimatedCount,
  stubGetVisitRoomUsage,
  stubCheckServiceAgencySwitch,
  stubPostServiceAgencySwitch,
  stubCheckServiceAgencySwitchNotFound,
  stubCheckServiceAgencySwitchAfterNotFound,
  stubCheckServiceAgencySwitchErrors,
  stubGetPrisonIncentiveLevels,
  stubGetPrisonIncentiveLevelsErrors,
}
