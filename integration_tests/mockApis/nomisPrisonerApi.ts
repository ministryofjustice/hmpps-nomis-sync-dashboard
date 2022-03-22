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

export default {
  stubNomisPrisonerPing,
}
