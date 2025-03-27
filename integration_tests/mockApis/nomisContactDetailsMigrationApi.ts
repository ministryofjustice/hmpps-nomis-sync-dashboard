import { SuperAgentRequest } from 'superagent'
import { stubFor } from './wiremock'

const stubStartContactPersonProfileDetailsMigration = (
  response: unknown = {
    migrationId: '2022-03-23T11:11:56',
    estimatedCount: 2,
    body: {
      prisonerNumber: 'A1234BC',
    },
  },
): SuperAgentRequest =>
  stubFor({
    request: {
      method: 'POST',
      urlPattern: '/nomis-migration-api/migrate/contact-person-profile-details',
    },
    response: {
      status: 200,
      headers: { 'Content-Type': 'application/json;charset=UTF-8' },
      jsonBody: response,
    },
  })

export default {
  stubStartContactPersonProfileDetailsMigration,
}
