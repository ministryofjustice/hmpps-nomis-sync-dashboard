import { SuperAgentRequest } from 'superagent'
import { MigrationHistory } from '../../server/@types/migration'
import { stubFor } from './wiremock'

export const appointmentsMigrationHistory: MigrationHistory[] = [
  {
    migrationId: '2022-03-14T10:13:56',
    whenStarted: '2022-03-14T10:13:56.878627',
    whenEnded: '2022-03-14T10:14:07.531409',
    estimatedRecordCount: 0,
    filter: '{"fromDate":"2022-03-04"}',
    recordsMigrated: 0,
    recordsFailed: 0,
    migrationType: 'APPOINTMENTS',
    status: 'COMPLETED',
    id: '2022-03-14T10:13:56',
    isNew: false,
  },
  {
    migrationId: '2022-03-14T11:45:12',
    whenStarted: '2022-03-14T11:45:12.615759',
    estimatedRecordCount: 205630,
    filter: '{}',
    recordsMigrated: 1,
    recordsFailed: 162794,
    migrationType: 'APPOINTMENTS',
    status: 'STARTED',
    id: '2022-03-14T11:45:12',
    isNew: false,
  },
  {
    migrationId: '2022-03-15T11:00:35',
    whenStarted: '2022-03-15T11:00:35.406626',
    whenEnded: '2022-03-15T11:00:45.990485',
    estimatedRecordCount: 4,
    filter: '{"toDate":"2022-04-17", "prisonIds": ["MDI","SWI"]}',
    recordsMigrated: 0,
    recordsFailed: 4,
    migrationType: 'APPOINTMENTS',
    status: 'COMPLETED',
    id: '2022-03-15T11:00:35',
    isNew: false,
  },
]

export const appointmentsFailures = {
  messagesFoundCount: 353,
  messagesReturnedCount: 5,
  messages: [
    {
      body: {
        context: {
          migrationId: '2022-03-23T16:12:43',
          estimatedCount: 93,
          body: {
            bookingId: 10310112,
            sequence: 1,
          },
        },
        type: 'MIGRATE_APPOINTMENTS',
      },
      messageId: 'afeb75fd-a2aa-41c4-9ede-b6bfe9590d36',
    },
    {
      body: {
        context: {
          migrationId: '2022-03-23T16:12:43',
          estimatedCount: 93,
          body: {
            bookingId: 10309678,
            sequence: 1,
          },
        },
        type: 'MIGRATE_APPOINTMENTS',
      },
      messageId: '86b96f0e-2ac3-445c-b3ac-0a4d525d371e',
    },
    {
      body: {
        context: {
          migrationId: '2022-03-24T13:39:33',
          estimatedCount: 292,
          body: {
            bookingId: 10243234,
            sequence: 1,
          },
        },
        type: 'MIGRATE_APPOINTMENTS',
      },
      messageId: '7e37a1e0-f041-42bc-9c2d-1da82d3bb83b',
    },
    {
      body: {
        context: {
          migrationId: '2022-03-24T13:39:33',
          estimatedCount: 292,
          body: {
            bookingId: 10243119,
            sequence: 1,
          },
        },
        type: 'MIGRATE_APPOINTMENTS',
      },
      messageId: '8d87f4d7-7846-48b2-ae93-5a7878dba502',
    },
    {
      body: {
        context: {
          migrationId: '2022-03-24T13:39:33',
          estimatedCount: 292,
          body: {
            bookingId: 10245176,
            sequence: 1,
          },
        },
        type: 'MIGRATE_APPOINTMENTS',
      },
      messageId: '230dcb1f-3391-4630-b907-3923ec9e0ee4',
    },
  ],
}

const stubStartAppointmentsMigration = (
  response: unknown = {
    migrationId: '2022-03-23T11:11:56',
    estimatedCount: 2,
    body: {
      fromDate: '2022-03-23',
      toDate: '2022-03-24',
    },
  },
): SuperAgentRequest =>
  stubFor({
    request: {
      method: 'POST',
      urlPattern: '/nomis-migration-api/migrate/appointments',
    },
    response: {
      status: 200,
      headers: { 'Content-Type': 'application/json;charset=UTF-8' },
      jsonBody: response,
    },
  })

export default {
  stubStartAppointmentsMigration,
}
