import { SuperAgentRequest } from 'superagent'
import { stubFor } from './wiremock'

const stubPing = (): SuperAgentRequest =>
  stubFor({
    request: {
      method: 'GET',
      urlPattern: '/activities-api/health/ping',
    },
    response: {
      status: 200,
      headers: { 'Content-Type': 'application/json;charset=UTF-8' },
      jsonBody: { status: 'UP' },
    },
  })

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
        appointmentsRolledOut: true,
        maxDaysToExpiry: 4,
        prisonLive: true,
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

export default {
  stubPing,
  stubGetDpsPrisonRollout,
  stubGetDpsPrisonRolloutErrors,
  stubGetDpsPayBands,
  stubGetDpsPayBandsErrors,
  stubGetDpsPrisonRegime,
  stubGetDpsPrisonRegimeErrors,
}
