import { SuperAgentRequest } from 'superagent'
import { stubFor } from './wiremock'
import { MigrationHistory } from '../../server/@types/migration'

const stubListOfVisitsMigrationHistory = (
  migrationHistory: MigrationHistory[] = defaultVisitsMigrationHistory,
): SuperAgentRequest =>
  stubFor({
    request: {
      method: 'GET',
      urlPattern: '/nomis-migration-api/migrate/visits/history?.*',
    },
    response: {
      status: 200,
      headers: {
        'Content-Type': 'application/json;charset=UTF-8',
      },
      jsonBody: migrationHistory,
    },
  })

const stubNomisMigrationPing = (): SuperAgentRequest =>
  stubFor({
    request: {
      method: 'GET',
      urlPattern: '/nomis-migration-api/health/ping',
    },
    response: {
      status: 200,
      headers: { 'Content-Type': 'application/json;charset=UTF-8' },
      jsonBody: { status: 'UP' },
    },
  })

const stubStartVisitsMigration = (
  response: unknown = {
    migrationId: '2022-03-23T11:11:56',
    estimatedCount: 2,
    body: {
      prisonIds: ['HEI'],
      visitTypes: ['SCON'],
      fromDateTime: '2022-03-23T12:00:00',
      toDateTime: '2022-03-24T12:00:00',
      ignoreMissingRoom: false,
    },
  },
): SuperAgentRequest =>
  stubFor({
    request: {
      method: 'POST',
      urlPattern: '/nomis-migration-api/migrate/visits',
    },
    response: {
      status: 200,
      headers: { 'Content-Type': 'application/json;charset=UTF-8' },
      jsonBody: response,
    },
  })

const defaultVisitsMigrationHistory: MigrationHistory[] = [
  {
    migrationId: '2022-03-14T10:13:56',
    whenStarted: '2022-03-14T10:13:56.878627',
    whenEnded: '2022-03-14T10:14:07.531409',
    estimatedRecordCount: 0,
    filter:
      '{"prisonIds":["HEI"],"visitTypes":["SCON"],"fromDateTime":"2022-03-04T16:01:00","ignoreMissingRoom":false}',
    recordsMigrated: 0,
    recordsFailed: 0,
    migrationType: 'VISITS',
    status: 'COMPLETED',
    id: '2022-03-14T10:13:56',
    isNew: false,
  },
  {
    migrationId: '2022-03-14T11:45:12',
    whenStarted: '2022-03-14T11:45:12.615759',
    estimatedRecordCount: 205630,
    filter: '{"prisonIds":["HEI"],"visitTypes":["SCON"],"ignoreMissingRoom":false}',
    recordsMigrated: 1,
    recordsFailed: 162794,
    migrationType: 'VISITS',
    status: 'STARTED',
    id: '2022-03-14T11:45:12',
    isNew: false,
  },
  {
    migrationId: '2022-03-15T11:00:35',
    whenStarted: '2022-03-15T11:00:35.406626',
    whenEnded: '2022-03-15T11:00:45.990485',
    estimatedRecordCount: 4,
    filter:
      '{"prisonIds":["MDI","HEI"],"visitTypes":["SCON"],"fromDateTime":"2022-03-15T09:01:00","ignoreMissingRoom":false}',
    recordsMigrated: 0,
    recordsFailed: 4,
    migrationType: 'VISITS',
    status: 'COMPLETED',
    id: '2022-03-15T11:00:35',
    isNew: false,
  },
]

const defaultVisitsFailures = {
  messagesFoundCount: 353,
  messagesReturnedCount: 5,
  messages: [
    {
      body: {
        context: {
          migrationId: '2022-03-23T16:12:43',
          estimatedCount: 93,
          body: {
            visitId: 10310112,
          },
        },
        type: 'MIGRATE_VISIT',
      },
      messageId: 'afeb75fd-a2aa-41c4-9ede-b6bfe9590d36',
    },
    {
      body: {
        context: {
          migrationId: '2022-03-23T16:12:43',
          estimatedCount: 93,
          body: {
            visitId: 10309678,
          },
        },
        type: 'MIGRATE_VISIT',
      },
      messageId: '86b96f0e-2ac3-445c-b3ac-0a4d525d371e',
    },
    {
      body: {
        context: {
          migrationId: '2022-03-24T13:39:33',
          estimatedCount: 292,
          body: {
            visitId: 10243234,
          },
        },
        type: 'MIGRATE_VISIT',
      },
      messageId: '7e37a1e0-f041-42bc-9c2d-1da82d3bb83b',
    },
    {
      body: {
        context: {
          migrationId: '2022-03-24T13:39:33',
          estimatedCount: 292,
          body: {
            visitId: 10243119,
          },
        },
        type: 'MIGRATE_VISIT',
      },
      messageId: '8d87f4d7-7846-48b2-ae93-5a7878dba502',
    },
    {
      body: {
        context: {
          migrationId: '2022-03-24T13:39:33',
          estimatedCount: 292,
          body: {
            visitId: 10245176,
          },
        },
        type: 'MIGRATE_VISIT',
      },
      messageId: '230dcb1f-3391-4630-b907-3923ec9e0ee4',
    },
  ],
}

const stubGetVisitsFailures = (failures: unknown = defaultVisitsFailures): SuperAgentRequest =>
  stubFor({
    request: {
      method: 'GET',
      urlPattern: '/nomis-migration-api/queue-admin/get-dlq-messages/dps-syscon-dev-visitsmigration_dlq',
    },
    response: {
      status: 200,
      headers: {
        'Content-Type': 'application/json;charset=UTF-8',
      },
      jsonBody: failures,
    },
  })

const stubDeleteVisitsFailures = (): SuperAgentRequest =>
  stubFor({
    request: {
      method: 'PUT',
      urlPattern: '/nomis-migration-api/queue-admin/purge-queue/dps-syscon-dev-visitsmigration_dlq',
    },
    response: {
      status: 200,
      headers: {
        'Content-Type': 'application/json;charset=UTF-8',
      },
      jsonBody: {
        messagesFoundCount: 5,
      },
    },
  })

const stubGetVisitsMigrationDetailsStarted = (migrationId: string): SuperAgentRequest =>
  stubFor({
    request: {
      method: 'GET',
      urlPattern: `/nomis-migration-api/migrate/visits/history/${migrationId}`,
    },
    response: {
      status: 200,
      headers: {
        'Content-Type': 'application/json;charset=UTF-8',
      },
      jsonBody: {
        migrationId,
        whenStarted: '2022-03-28T13:59:24.657071',
        whenEnded: null,
        estimatedRecordCount: 26602,
        filter:
          '{"prisonIds":["HEI"],"visitTypes":["SCON"],"fromDateTime":"2016-03-23T00:00:00","ignoreMissingRoom":false}',
        recordsMigrated: 12091,
        recordsFailed: 123,
        migrationType: 'VISITS',
        status: 'STARTED',
        id: migrationId,
      },
    },
  })

const stubGetVisitsMigrationDetailsCompleted = ({
  migrationId,
  migrated,
  failed,
  whenEnded,
}: {
  migrationId: string
  migrated: number
  failed: string
  whenEnded: string
}): SuperAgentRequest =>
  stubFor({
    request: {
      method: 'GET',
      urlPattern: `/nomis-migration-api/migrate/visits/history/${migrationId}`,
    },
    response: {
      status: 200,
      headers: {
        'Content-Type': 'application/json;charset=UTF-8',
      },
      jsonBody: {
        migrationId,
        whenStarted: '2022-03-28T13:59:24.657071',
        whenEnded,
        estimatedRecordCount: 26602,
        filter:
          '{"prisonIds":["HEI"],"visitTypes":["SCON"],"fromDateTime":"2016-03-23T00:00:00","ignoreMissingRoom":false}',
        recordsMigrated: migrated,
        recordsFailed: failed,
        migrationType: 'VISITS',
        status: 'COMPLETED',
        id: migrationId,
      },
    },
  })

const stubListOfSentencingMigrationHistory = (
  migrationHistory: MigrationHistory[] = defaultSentencingMigrationHistory,
): SuperAgentRequest =>
  stubFor({
    request: {
      method: 'GET',
      urlPattern: '/nomis-migration-api/migrate/sentencing/history?.*',
    },
    response: {
      status: 200,
      headers: {
        'Content-Type': 'application/json;charset=UTF-8',
      },
      jsonBody: migrationHistory,
    },
  })

const stubStartSentencingMigration = (
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
      urlPattern: '/nomis-migration-api/migrate/sentencing',
    },
    response: {
      status: 200,
      headers: { 'Content-Type': 'application/json;charset=UTF-8' },
      jsonBody: response,
    },
  })

const defaultSentencingMigrationHistory: MigrationHistory[] = [
  {
    migrationId: '2022-03-14T10:13:56',
    whenStarted: '2022-03-14T10:13:56.878627',
    whenEnded: '2022-03-14T10:14:07.531409',
    estimatedRecordCount: 0,
    filter: '{"fromDate":"2022-03-04"}',
    recordsMigrated: 0,
    recordsFailed: 0,
    migrationType: 'SENTENCING_ADJUSTMENTS',
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
    migrationType: 'SENTENCING_ADJUSTMENTS',
    status: 'STARTED',
    id: '2022-03-14T11:45:12',
    isNew: false,
  },
  {
    migrationId: '2022-03-15T11:00:35',
    whenStarted: '2022-03-15T11:00:35.406626',
    whenEnded: '2022-03-15T11:00:45.990485',
    estimatedRecordCount: 4,
    filter: '{"fromDate":"2022-03-15"}',
    recordsMigrated: 0,
    recordsFailed: 4,
    migrationType: 'SENTENCING_ADJUSTMENTS',
    status: 'COMPLETED',
    id: '2022-03-15T11:00:35',
    isNew: false,
  },
]

const defaultSentencingFailures = {
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
        type: 'MIGRATE_SENTENCING',
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
        type: 'MIGRATE_SENTENCING',
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
        type: 'MIGRATE_SENTENCING',
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
        type: 'MIGRATE_SENTENCING',
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
        type: 'MIGRATE_SENTENCING',
      },
      messageId: '230dcb1f-3391-4630-b907-3923ec9e0ee4',
    },
  ],
}

const stubHealth = (): SuperAgentRequest =>
  stubFor({
    request: {
      method: 'GET',
      urlPattern: '/nomis-migration-api/health',
    },
    response: {
      status: 200,
      headers: {
        'Content-Type': 'application/json;charset=UTF-8',
      },
      jsonBody: {
        status: 'UP',
        components: {
          'migrationvisits-health': {
            status: 'UP',
            details: {
              queueName: 'dps-syscon-dev-visitsmigration_queue',
              messagesOnQueue: '0',
              messagesInFlight: '0',
              dlqStatus: 'UP',
              dlqName: 'dps-syscon-dev-visitsmigration_dlq',
              messagesOnDlq: '153',
            },
          },
          'migrationsentencing-health': {
            status: 'UP',
            details: {
              queueName: 'dps-syscon-dev-sentencingmigration_queue',
              messagesOnQueue: '0',
              messagesInFlight: '0',
              dlqStatus: 'UP',
              dlqName: 'dps-syscon-dev-sentencingmigration_dlq',
              messagesOnDlq: '153',
            },
          },
          'migrationappointments-health': {
            status: 'UP',
            details: {
              queueName: 'dps-syscon-dev-appointmentsmigration_queue',
              messagesOnQueue: '0',
              messagesInFlight: '0',
              dlqStatus: 'UP',
              dlqName: 'dps-syscon-dev-appointmentsmigration_dlq',
              messagesOnDlq: '153',
            },
          },
        },
        groups: ['liveness', 'readiness'],
      },
    },
  })

const stubGetSentencingFailures = (failures: unknown = defaultSentencingFailures): SuperAgentRequest =>
  stubFor({
    request: {
      method: 'GET',
      urlPattern: '/nomis-migration-api/queue-admin/get-dlq-messages/dps-syscon-dev-sentencingmigration_dlq',
    },
    response: {
      status: 200,
      headers: {
        'Content-Type': 'application/json;charset=UTF-8',
      },
      jsonBody: failures,
    },
  })

const stubDeleteSentencingFailures = (): SuperAgentRequest =>
  stubFor({
    request: {
      method: 'PUT',
      urlPattern: '/nomis-migration-api/queue-admin/purge-queue/dps-syscon-dev-sentencingmigration_dlq',
    },
    response: {
      status: 200,
      headers: {
        'Content-Type': 'application/json;charset=UTF-8',
      },
      jsonBody: {
        messagesFoundCount: 5,
      },
    },
  })

const stubGetSentencingMigrationDetailsStarted = (migrationId: string): SuperAgentRequest =>
  stubFor({
    request: {
      method: 'GET',
      urlPattern: `/nomis-migration-api/migrate/sentencing/history/${migrationId}`,
    },
    response: {
      status: 200,
      headers: {
        'Content-Type': 'application/json;charset=UTF-8',
      },
      jsonBody: {
        migrationId,
        whenStarted: '2022-03-28T13:59:24.657071',
        whenEnded: null,
        estimatedRecordCount: 26602,
        filter: '{"fromDate":"2016-03-23"}',
        recordsMigrated: 12091,
        recordsFailed: 123,
        migrationType: 'SENTENCING',
        status: 'STARTED',
        id: migrationId,
      },
    },
  })

const stubMigrationInProgress = ({
  domain,
  type,
  migrationId,
  migrated,
  failed,
  stillToBeProcessed,
}: {
  domain: string
  type: string
  migrationId: string
  migrated: number
  failed: string
  stillToBeProcessed: string
}): SuperAgentRequest =>
  stubFor({
    request: {
      method: 'GET',
      urlPattern: `/nomis-migration-api/migrate/${domain}/active-migration`,
    },
    response: {
      status: 200,
      headers: {
        'Content-Type': 'application/json;charset=UTF-8',
      },
      jsonBody: {
        recordsMigrated: migrated,
        toBeProcessedCount: stillToBeProcessed,
        beingProcessedCount: 0,
        recordsFailed: failed,
        migrationId: `${migrationId}`,
        whenStarted: '2023-05-02T11:07:09.719517',
        estimatedRecordCount: 6,
        migrationType: `${type}`,
        status: 'STARTED',
      },
    },
  })

const stubMigrationInProgressCompleted = ({
  domain,
  type,
  migrationId,
}: {
  domain: string
  type: string
  migrationId: string
}): SuperAgentRequest =>
  stubFor({
    request: {
      method: 'GET',
      urlPattern: `/nomis-migration-api/migrate/${domain}/active-migration`,
    },
    response: {
      status: 200,
      headers: {
        'Content-Type': 'application/json;charset=UTF-8',
      },
      jsonBody: {
        recordsMigrated: 0,
        toBeProcessedCount: 0,
        beingProcessedCount: 0,
        recordsFailed: 999,
        migrationId: `${migrationId}`,
        whenStarted: '2023-05-02T11:07:09.719517',
        estimatedRecordCount: 6,
        migrationType: `${type}`,
        status: 'COMPLETED',
      },
    },
  })

const stubGetSentencingMigrationDetailsCompleted = ({
  migrationId,
  migrated,
  failed,
  whenEnded,
}: {
  migrationId: string
  migrated: number
  failed: string
  whenEnded: string
}): SuperAgentRequest =>
  stubFor({
    request: {
      method: 'GET',
      urlPattern: `/nomis-migration-api/migrate/sentencing/history/${migrationId}`,
    },
    response: {
      status: 200,
      headers: {
        'Content-Type': 'application/json;charset=UTF-8',
      },
      jsonBody: {
        migrationId,
        whenStarted: '2022-03-28T13:59:24.657071',
        whenEnded,
        estimatedRecordCount: 26602,
        filter: '{"fromDate":"2016-03-23"}',
        recordsMigrated: migrated,
        recordsFailed: failed,
        migrationType: 'SENTENCING',
        status: 'COMPLETED',
        id: migrationId,
      },
    },
  })

const stubListOfAppointmentsMigrationHistory = (
  migrationHistory: MigrationHistory[] = defaultAppointmentsMigrationHistory,
): SuperAgentRequest =>
  stubFor({
    request: {
      method: 'GET',
      urlPattern: '/nomis-migration-api/history?.*',
    },
    response: {
      status: 200,
      headers: {
        'Content-Type': 'application/json;charset=UTF-8',
      },
      jsonBody: migrationHistory,
    },
  })

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

const defaultAppointmentsMigrationHistory: MigrationHistory[] = [
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

const defaultAppointmentsFailures = {
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

const stubGetAppointmentsFailures = (failures: unknown = defaultAppointmentsFailures): SuperAgentRequest =>
  stubFor({
    request: {
      method: 'GET',
      urlPattern: '/nomis-migration-api/queue-admin/get-dlq-messages/dps-syscon-dev-appointmentsmigration_dlq',
    },
    response: {
      status: 200,
      headers: {
        'Content-Type': 'application/json;charset=UTF-8',
      },
      jsonBody: failures,
    },
  })

const stubDeleteAppointmentsFailures = (): SuperAgentRequest =>
  stubFor({
    request: {
      method: 'PUT',
      urlPattern: '/nomis-migration-api/queue-admin/purge-queue/dps-syscon-dev-appointmentsmigration_dlq',
    },
    response: {
      status: 200,
      headers: {
        'Content-Type': 'application/json;charset=UTF-8',
      },
      jsonBody: {
        messagesFoundCount: 5,
      },
    },
  })

const stubGetAppointmentsMigrationDetailsStarted = (migrationId: string): SuperAgentRequest =>
  stubFor({
    request: {
      method: 'GET',
      urlPattern: `/nomis-migration-api/migrate/appointments/history/${migrationId}`,
    },
    response: {
      status: 200,
      headers: {
        'Content-Type': 'application/json;charset=UTF-8',
      },
      jsonBody: {
        migrationId,
        whenStarted: '2022-03-28T13:59:24.657071',
        whenEnded: null,
        estimatedRecordCount: 26602,
        filter: '{"fromDate":"2016-03-23"}',
        recordsMigrated: 12091,
        recordsFailed: 123,
        migrationType: 'APPOINTMENTS',
        status: 'STARTED',
        id: migrationId,
      },
    },
  })

const stubGetAppointmentsMigrationDetailsCompleted = ({
  migrationId,
  migrated,
  failed,
  whenEnded,
}: {
  migrationId: string
  migrated: number
  failed: string
  whenEnded: string
}): SuperAgentRequest =>
  stubFor({
    request: {
      method: 'GET',
      urlPattern: `/nomis-migration-api/migrate/appointments/history/${migrationId}`,
    },
    response: {
      status: 200,
      headers: {
        'Content-Type': 'application/json;charset=UTF-8',
      },
      jsonBody: {
        migrationId,
        whenStarted: '2022-03-28T13:59:24.657071',
        whenEnded,
        estimatedRecordCount: 26602,
        filter: '{"fromDate":"2016-03-23"}',
        recordsMigrated: migrated,
        recordsFailed: failed,
        migrationType: 'APPOINTMENTS',
        status: 'COMPLETED',
        id: migrationId,
      },
    },
  })

const stubGetVisitMigrationRoomUsage = (): SuperAgentRequest =>
  stubFor({
    request: {
      method: 'GET',
      urlPath: '/nomis-migration-api/migrate/visits/rooms/usage',
    },
    response: {
      status: 200,
      headers: { 'Content-Type': 'application/json;charset=UTF-8' },
      jsonBody: [
        {
          agencyInternalLocationDescription: 'AGI-VISITS-OFF_VIS',
          count: 95,
          vsipRoom: 'vsip1',
        },
        {
          agencyInternalLocationDescription: 'AGI-VISITS-SOC_VIS',
          count: 14314,
        },
        {
          agencyInternalLocationDescription: 'AKI-VISITS-3RD SECTOR',
          count: 390,
          vsipRoom: 'vsip4',
        },
      ],
    },
  })

export default {
  stubListOfVisitsMigrationHistory,
  stubStartVisitsMigration,
  stubGetVisitsFailures,
  stubDeleteVisitsFailures,
  stubGetVisitsMigrationDetailsStarted,
  stubGetVisitsMigrationDetailsCompleted,

  stubListOfSentencingMigrationHistory,
  stubStartSentencingMigration,
  stubGetSentencingFailures,
  stubDeleteSentencingFailures,
  stubGetSentencingMigrationDetailsStarted,
  stubGetSentencingMigrationDetailsCompleted,

  stubListOfAppointmentsMigrationHistory,
  stubStartAppointmentsMigration,
  stubGetAppointmentsFailures,
  stubDeleteAppointmentsFailures,
  stubGetAppointmentsMigrationDetailsStarted,
  stubGetAppointmentsMigrationDetailsCompleted,

  stubNomisMigrationPing,
  stubHealth,
  stubMigrationInProgress,
  stubMigrationInProgressCompleted,
  stubGetVisitMigrationRoomUsage,
}
