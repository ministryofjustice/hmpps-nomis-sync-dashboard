import { SuperAgentRequest } from 'superagent'
import { stubFor } from './wiremock'

const stubGetVisitRoomMappings = (prison: string): SuperAgentRequest =>
  stubFor({
    request: {
      method: 'GET',
      urlPath: `/mapping-api/prison/${prison}/room-mappings`,
    },
    response: {
      status: 200,
      headers: { 'Content-Type': 'application/json;charset=UTF-8' },
      jsonBody: [
        {
          vsipId: 'Visits Main Room',
          nomisRoomDescription: 'HEI-OPEN-1',
          prisonId: 'HEI',
          isOpen: true,
        },
        {
          vsipId: 'Visits closed Room',
          nomisRoomDescription: 'HEI-CLOSED-2',
          prisonId: 'HEI',
          isOpen: false,
        },
      ],
    },
  })

const stubAddVisitsRoomMapping = (prisonId: string): SuperAgentRequest =>
  stubFor({
    request: {
      method: 'POST',
      urlPattern: `/mapping-api/prison/${prisonId}/room-mappings`,
    },
    response: {
      status: 201,
      headers: { 'Content-Type': 'application/json;charset=UTF-8' },
    },
  })

const stubMappingApiPing = (): SuperAgentRequest =>
  stubFor({
    request: {
      method: 'GET',
      urlPattern: '/mapping-api/health/ping',
    },
    response: {
      status: 200,
      headers: { 'Content-Type': 'application/json;charset=UTF-8' },
      jsonBody: { status: 'UP' },
    },
  })

export default {
  stubGetVisitRoomMappings,
  stubAddVisitsRoomMapping,
  stubMappingApiPing,
}
