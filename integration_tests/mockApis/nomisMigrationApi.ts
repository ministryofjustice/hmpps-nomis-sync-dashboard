import { SuperAgentRequest } from 'superagent'
import { stubFor } from './wiremock'

const stubListOfMigrationHistory = (migrationHistory: unknown): SuperAgentRequest =>
  stubFor({
    request: {
      method: 'GET',
      urlPattern: '/nomis-migration-api/migrate/visits/history*',
    },
    response: {
      status: 200,
      headers: {
        'Content-Type': 'application/json;charset=UTF-8',
      },
      jsonBody: migrationHistory,
    },
  })

export default {
  stubListOfMigrationHistory,
}
