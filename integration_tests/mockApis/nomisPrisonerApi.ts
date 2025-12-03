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

const stubCheckServiceAgencySwitch = (service: string): SuperAgentRequest =>
  stubFor({
    request: {
      method: 'GET',
      urlPattern: `/nomis-prisoner-api/agency-switches/${service}/agency/.*`,
    },
    response: {
      status: 204,
    },
  })

const stubPostServiceAgencySwitch = (): SuperAgentRequest =>
  stubFor({
    request: {
      method: 'POST',
      urlPattern: '/nomis-prisoner-api/agency-switches/ACTIVITY/agency/.*',
    },
    response: {
      status: 201,
    },
  })

const stubCheckServiceAgencySwitchNotFound = (service: string): SuperAgentRequest =>
  stubFor({
    request: {
      method: 'GET',
      urlPattern: `/nomis-prisoner-api/agency-switches/${service}/agency/.*`,
    },
    response: {
      status: 404,
    },
    scenarioName: 'Switch not found',
    requiredScenarioState: 'Started',
    newScenarioState: 'Not found',
  })

const stubCheckServiceAgencySwitchAfterNotFound = (service: string): SuperAgentRequest =>
  stubFor({
    request: {
      method: 'GET',
      urlPattern: `/nomis-prisoner-api/agency-switches/${service}/agency/.*`,
    },
    response: {
      status: 204,
    },
    scenarioName: 'Switch not found',
    requiredScenarioState: 'Not found',
  })

const stubCheckServiceAgencySwitchErrors = (service: string): SuperAgentRequest =>
  stubFor({
    request: {
      method: 'GET',
      urlPattern: `/nomis-prisoner-api/agency-switches/${service}/agency/.*`,
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

const stubGetActivitiesMigrationEstimatedCount = (count: number): SuperAgentRequest =>
  stubFor({
    request: {
      method: 'GET',
      urlPath: '/nomis-prisoner-api/activities/ids',
    },
    response: {
      status: 200,
      headers: { 'Content-Type': 'application/json;charset=UTF-8' },
      jsonBody: {
        content: [
          {
            courseActivityId: 12345,
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

const stubGetAllocationsMigrationEstimatedCount = (count: number): SuperAgentRequest =>
  stubFor({
    request: {
      method: 'GET',
      urlPath: '/nomis-prisoner-api/allocations/ids',
    },
    response: {
      status: 200,
      headers: { 'Content-Type': 'application/json;charset=UTF-8' },
      jsonBody: {
        content: [
          {
            courseActivityId: 12345,
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

const stubFindSuspendedAllocations = (): SuperAgentRequest =>
  stubFor({
    request: {
      method: 'GET',
      urlPattern: '/nomis-prisoner-api/allocations/suspended.*',
    },
    response: {
      status: 200,
      headers: { 'Content-Type': 'application/json;charset=UTF-8' },
      jsonBody: [
        {
          offenderNo: 'A1234AA',
          courseActivityId: 12345,
          courseActivityDescription: 'Kitchens AM',
        },
      ],
    },
  })

const stubFindSuspendedAllocationsErrors = (): SuperAgentRequest =>
  stubFor({
    request: {
      method: 'GET',
      urlPattern: '/nomis-prisoner-api/allocations/suspended/.*',
    },
    response: {
      status: 500,
    },
  })

const stubFindAllocationsWithMissingPayBands = (): SuperAgentRequest =>
  stubFor({
    request: {
      method: 'GET',
      urlPattern: '/nomis-prisoner-api/allocations/missing-pay-bands.*',
    },
    response: {
      status: 200,
      headers: { 'Content-Type': 'application/json;charset=UTF-8' },
      jsonBody: [
        {
          offenderNo: 'A1234AA',
          incentiveLevel: 'STD',
          courseActivityId: 12345,
          courseActivityDescription: 'Kitchens AM',
        },
      ],
    },
  })

const stubFindAllocationsWithMissingPayBandsErrors = (): SuperAgentRequest =>
  stubFor({
    request: {
      method: 'GET',
      urlPattern: '/nomis-prisoner-api/allocations/missing-pay-bands.*',
    },
    response: {
      status: 500,
    },
  })

const stubFindPayRatesWithUnknownIncentive = (): SuperAgentRequest =>
  stubFor({
    request: {
      method: 'GET',
      urlPattern: '/nomis-prisoner-api/activities/rates-with-unknown-incentives.*',
    },
    response: {
      status: 200,
      headers: { 'Content-Type': 'application/json;charset=UTF-8' },
      jsonBody: [
        {
          courseActivityId: 12345,
          courseActivityDescription: 'Kitchens AM',
          payBandCode: '5',
          incentiveLevel: 'STD',
        },
      ],
    },
  })

const stubFindPayRatesWithUnknownIncentiveErrors = (): SuperAgentRequest =>
  stubFor({
    request: {
      method: 'GET',
      urlPattern: '/nomis-prisoner-api/activities/rates-with-unknown-incentives.*',
    },
    response: {
      status: 500,
    },
  })

const stubFindActivitiesWithoutScheduleRules = (): SuperAgentRequest =>
  stubFor({
    request: {
      method: 'GET',
      urlPattern: '/nomis-prisoner-api/activities/without-schedule-rules.*',
    },
    response: {
      status: 200,
      headers: { 'Content-Type': 'application/json;charset=UTF-8' },
      jsonBody: [
        {
          courseActivityId: 12345,
          courseActivityDescription: 'Kitchens AM',
        },
      ],
    },
  })

const stubFindActivitiesWithoutScheduleRulesErrors = (): SuperAgentRequest =>
  stubFor({
    request: {
      method: 'GET',
      urlPattern: '/nomis-prisoner-api/activities/without-schedule-rules.*',
    },
    response: {
      status: 500,
    },
  })

const stubGetAppointmentCounts = (): SuperAgentRequest =>
  stubFor({
    request: {
      method: 'GET',
      urlPattern: '/nomis-prisoner-api/appointments/counts.*',
    },
    response: {
      status: 200,
      headers: { 'Content-Type': 'application/json;charset=UTF-8' },
      jsonBody: [
        {
          prisonId: 'MSI',
          eventSubType: 'ACCA',
          future: false,
          count: 20,
        },
      ],
    },
  })

const stubGetAppointmentCountsErrors = (): SuperAgentRequest =>
  stubFor({
    request: {
      method: 'GET',
      urlPattern: '/nomis-prisoner-api/appointments/counts.*',
    },
    response: {
      status: 500,
    },
  })

const stubGetIncidentsMigrationEstimatedCount = (count: number): SuperAgentRequest =>
  stubFor({
    request: {
      method: 'GET',
      urlPath: '/nomis-prisoner-api/incidents/ids',
    },
    response: {
      status: 200,
      headers: { 'Content-Type': 'application/json;charset=UTF-8' },
      jsonBody: {
        content: [
          {
            incidentId: 180935,
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

const stubGetPrisonerBalanceMigrationEstimatedCount = (count: number): SuperAgentRequest =>
  stubFor({
    request: {
      method: 'GET',
      urlPath: '/nomis-prisoner-api/finance/prisoners/ids',
    },
    response: {
      status: 200,
      headers: { 'Content-Type': 'application/json;charset=UTF-8' },
      jsonBody: {
        content: [180935],
        page: {
          size: 1,
          number: 0,
          totalElements: count,
          totalPages: count,
        },
      },
    },
  })

const stubGetPrisonBalanceMigrationEstimatedCount = (count: number): SuperAgentRequest =>
  stubFor({
    request: {
      method: 'GET',
      urlPath: '/nomis-prisoner-api/finance/prison/ids',
    },
    response: {
      status: 200,
      headers: { 'Content-Type': 'application/json;charset=UTF-8' },
      jsonBody: new Array(count),
    },
  })

const stubGetPrisonersMigrationEstimatedCount = (count: number): SuperAgentRequest =>
  stubFor({
    request: {
      method: 'GET',
      urlPath: '/nomis-prisoner-api/prisoners/ids/all',
    },
    response: {
      status: 200,
      headers: { 'Content-Type': 'application/json;charset=UTF-8' },
      jsonBody: {
        content: [
          {
            courseActivityId: 12345,
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

const stubGetVisitslotsMigrationEstimatedCount = (count: number): SuperAgentRequest =>
  stubFor({
    request: {
      method: 'GET',
      urlPath: '/nomis-prisoner-api/visits/configuration/time-slots/ids',
    },
    response: {
      status: 200,
      headers: { 'Content-Type': 'application/json;charset=UTF-8' },
      jsonBody: {
        content: [
          {
            prisonId: 'MDI',
            dayOfWeek: 'MONDAY',
            timeSlotSequence: 1,
          },
        ],
        page: {
          size: 1,
          number: 0,
          totalElements: count,
          totalPages: count,
        },
      },
    },
  })
const stubGetOfficialvisitsMigrationEstimatedCount = (count: number): SuperAgentRequest =>
  stubFor({
    request: {
      method: 'GET',
      urlPath: '/nomis-prisoner-api/official-visits/ids',
    },
    response: {
      status: 200,
      headers: { 'Content-Type': 'application/json;charset=UTF-8' },
      jsonBody: {
        content: [
          {
            visitId: 1,
          },
        ],
        page: {
          size: 1,
          number: 0,
          totalElements: count,
          totalPages: count,
        },
      },
    },
  })

export default {
  stubNomisPrisonerPing,
  stubGetVisitMigrationEstimatedCount,
  stubGetIncidentsMigrationEstimatedCount,
  stubGetAppointmentsMigrationEstimatedCount,
  stubGetVisitRoomUsage,
  stubCheckServiceAgencySwitch,
  stubPostServiceAgencySwitch,
  stubCheckServiceAgencySwitchNotFound,
  stubCheckServiceAgencySwitchAfterNotFound,
  stubCheckServiceAgencySwitchErrors,
  stubGetPrisonIncentiveLevels,
  stubGetActivitiesMigrationEstimatedCount,
  stubGetAllocationsMigrationEstimatedCount,
  stubGetPrisonIncentiveLevelsErrors,
  stubFindSuspendedAllocations,
  stubFindSuspendedAllocationsErrors,
  stubFindAllocationsWithMissingPayBands,
  stubFindAllocationsWithMissingPayBandsErrors,
  stubFindPayRatesWithUnknownIncentive,
  stubFindPayRatesWithUnknownIncentiveErrors,
  stubFindActivitiesWithoutScheduleRules,
  stubFindActivitiesWithoutScheduleRulesErrors,
  stubGetAppointmentCounts,
  stubGetAppointmentCountsErrors,
  stubGetPrisonersMigrationEstimatedCount,
  stubGetVisitslotsMigrationEstimatedCount,
  stubGetPrisonBalanceMigrationEstimatedCount,
  stubGetPrisonerBalanceMigrationEstimatedCount,
  stubGetOfficialvisitsMigrationEstimatedCount,
}
