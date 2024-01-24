import { SuperAgentRequest } from 'superagent'
import { stubFor } from './wiremock'

const stubGetDpsPrisonRollout = (): SuperAgentRequest =>
  stubFor({
    request: {
      method: 'GET',
      urlPattern: '/activities-api/rollout/.*',
    },
    response: {
      status: 200,
      headers: { 'Content-Type': 'application/json;charset=UTF-8' },
      jsonBody: {
        prisonCode: 'MDI',
        activitiesRolledOut: false,
        activitiesRolloutDate: null,
        appointmentsRolledOut: true,
        appointmentsRolloutDate: '2024-01-01',
      },
    },
  })

const stubGetDpsPrisonRolloutErrors = (): SuperAgentRequest =>
  stubFor({
    request: {
      method: 'GET',
      urlPattern: '/activities-api/rollout/.*',
    },
    response: {
      status: 500,
    },
  })

const stubGetDpsPayBands = (): SuperAgentRequest =>
  stubFor({
    request: {
      method: 'GET',
      urlPattern: '/activities-api/prison/.*/prison-pay-bands',
    },
    response: {
      status: 200,
      headers: { 'Content-Type': 'application/json;charset=UTF-8' },
      jsonBody: [],
    },
  })

const stubGetDpsPayBandsErrors = (): SuperAgentRequest =>
  stubFor({
    request: {
      method: 'GET',
      urlPattern: '/activities-api/prison/.*/prison-pay-bands',
    },
    response: {
      status: 500,
    },
  })

const stubGetDpsPrisonRegime = (): SuperAgentRequest =>
  stubFor({
    request: {
      method: 'GET',
      urlPattern: '/activities-api/prison/prison-regime/.*',
    },
    response: {
      status: 404,
    },
  })

const stubGetDpsPrisonRegimeErrors = (): SuperAgentRequest =>
  stubFor({
    request: {
      method: 'GET',
      urlPattern: '/activities-api/prison/prison-regime/.*',
    },
    response: {
      status: 500,
    },
  })

const stubGetActivityCategories = (): SuperAgentRequest =>
  stubFor({
    request: {
      method: 'GET',
      urlPattern: '/activities-api/activity-categories',
    },
    response: {
      status: 200,
      jsonBody: ['SAA_EDUCATION', 'SAA_INDUSTRY'],
    },
  })

export default {
  stubGetDpsPrisonRollout,
  stubGetDpsPrisonRolloutErrors,
  stubGetDpsPayBands,
  stubGetDpsPayBandsErrors,
  stubGetDpsPrisonRegime,
  stubGetDpsPrisonRegimeErrors,
  stubGetActivityCategories,
}
