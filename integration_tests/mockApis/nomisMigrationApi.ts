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
const defaultFailures = {
  messagesFoundCount: 353,
  messagesReturnedCount: 5,
  messages: [
    {
      body: {
        context: {
          migrationId: '2022-03-23T16:12:43',
          estimatedCount: 93,
          body: {},
        },
        type: 'MIGRATE_GENERIC',
      },
      messageId: 'afeb75fd-a2aa-41c4-9ede-b6bfe9590d36',
    },
    {
      body: {
        context: {
          migrationId: '2022-03-23T16:12:43',
          estimatedCount: 93,
          body: {},
        },
        type: 'MIGRATE_GENERIC',
      },
      messageId: '86b96f0e-2ac3-445c-b3ac-0a4d525d371e',
    },
    {
      body: {
        context: {
          migrationId: '2022-03-24T13:39:33',
          estimatedCount: 292,
          body: {},
        },
        type: 'MIGRATE_GENERIC',
      },
      messageId: '7e37a1e0-f041-42bc-9c2d-1da82d3bb83b',
    },
    {
      body: {
        context: {
          migrationId: '2022-03-24T13:39:33',
          estimatedCount: 292,
          body: {},
        },
        type: 'MIGRATE_GENERIC',
      },
      messageId: '8d87f4d7-7846-48b2-ae93-5a7878dba502',
    },
    {
      body: {
        context: {
          migrationId: '2022-03-24T13:39:33',
          estimatedCount: 292,
          body: {},
        },
        type: 'MIGRATE_GENERIC',
      },
      messageId: '230dcb1f-3391-4630-b907-3923ec9e0ee4',
    },
  ],
}

const stubHealth = (failures: string = '153'): SuperAgentRequest =>
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
              messagesOnDlq: `${failures}`,
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
              messagesOnDlq: `${failures}`,
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
              messagesOnDlq: `${failures}`,
            },
          },
          'migrationactivities-health': {
            status: 'UP',
            details: {
              queueName: 'dps-syscon-dev-activitiesmigration_queue',
              messagesOnQueue: '0',
              messagesInFlight: '0',
              dlqStatus: 'UP',
              dlqName: 'dps-syscon-dev-activitiesmigration_dlq',
              messagesOnDlq: `${failures}`,
            },
          },
          'migrationallocations-health': {
            status: 'UP',
            details: {
              queueName: 'dps-syscon-dev-allocationsmigration_queue',
              messagesOnQueue: '0',
              messagesInFlight: '0',
              dlqStatus: 'UP',
              dlqName: 'dps-syscon-dev-allocationsmigration_dlq',
              messagesOnDlq: `${failures}`,
            },
          },
          'migrationincidents-health': {
            status: 'UP',
            details: {
              queueName: 'dps-syscon-dev-incidentsmigration_queue',
              messagesOnQueue: '0',
              messagesInFlight: '0',
              dlqStatus: 'UP',
              dlqName: 'dps-syscon-dev-incidentsmigration_dlq',
              messagesOnDlq: `${failures}`,
            },
          },
          'migrationcsip-health': {
            status: 'UP',
            details: {
              queueName: 'dps-syscon-dev-csipmigration_queue',
              messagesOnQueue: '0',
              messagesInFlight: '0',
              dlqStatus: 'UP',
              dlqName: 'dps-syscon-dev-csipmigration_dlq',
              messagesOnDlq: `${failures}`,
            },
          },
          'migrationcoreperson-health': {
            status: 'UP',
            details: {
              queueName: 'dps-syscon-dev-corepersonmigration_queue',
              messagesOnQueue: '0',
              messagesInFlight: '0',
              dlqStatus: 'UP',
              dlqName: 'dps-syscon-dev-corepersonmigration_dlq',
              messagesOnDlq: `${failures}`,
            },
          },
          'migrationpersonalrelationships-health': {
            status: 'UP',
            details: {
              queueName: 'dps-syscon-dev-migration_personalrelationships_queue',
              messagesOnQueue: '0',
              messagesInFlight: '0',
              dlqStatus: 'UP',
              dlqName: 'dps-syscon-dev-migration_personalrelationships_dlq',
              messagesOnDlq: `${failures}`,
            },
          },
          'migrationpersonalrelationshipsprofiledetails-health': {
            status: 'UP',
            details: {
              queueName: 'dps-syscon-dev-migration_personalrelationships_profiledetails_queue',
              messagesOnQueue: '0',
              messagesInFlight: '0',
              dlqStatus: 'UP',
              dlqName: 'dps-syscon-dev-migration_personalrelationships_profiledetails_dlq',
              messagesOnDlq: `${failures}`,
            },
          },
          'migrationorganisations-health': {
            status: 'UP',
            details: {
              queueName: 'dps-syscon-dev-migration_organisations_queue',
              messagesOnQueue: '0',
              messagesInFlight: '0',
              dlqStatus: 'UP',
              dlqName: 'dps-syscon-dev-migration_organisations_dlq',
              messagesOnDlq: `${failures}`,
            },
          },
          'migrationvisitbalance-health': {
            status: 'UP',
            details: {
              queueName: 'syscon-devs-dev-migration_visitbalance_queue',
              messagesOnQueue: '0',
              messagesInFlight: '0',
              dlqStatus: 'UP',
              dlqName: 'syscon-devs-dev-migration_visitbalance_dlq',
              messagesOnDlq: `${failures}`,
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
      urlPattern: '/nomis-migration-api/migrate/appointments/history?.*',
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

const stubListOfActivitiesMigrationHistory = (
  migrationHistory: MigrationHistory[] = defaultActivitiesMigrationHistory,
): SuperAgentRequest =>
  stubFor({
    request: {
      method: 'GET',
      urlPattern: '/nomis-migration-api/migrate/activities/history?.*',
    },
    response: {
      status: 200,
      headers: {
        'Content-Type': 'application/json;charset=UTF-8',
      },
      jsonBody: migrationHistory,
    },
  })

const stubStartActivitiesMigration = (
  response: unknown = {
    migrationId: '2022-03-23T11:11:56',
    estimatedCount: 2,
    body: {
      prisonId: 'MDI',
    },
  },
): SuperAgentRequest =>
  stubFor({
    request: {
      method: 'POST',
      urlPattern: '/nomis-migration-api/migrate/activities',
    },
    response: {
      status: 200,
      headers: { 'Content-Type': 'application/json;charset=UTF-8' },
      jsonBody: response,
    },
  })

const defaultActivitiesMigrationHistory: MigrationHistory[] = [
  {
    migrationId: '2022-03-14T10:13:56',
    whenStarted: '2022-03-14T10:13:56.878627',
    whenEnded: '2022-03-14T10:14:07.531409',
    estimatedRecordCount: 0,
    filter: '{"prisonId": "MDI"}',
    recordsMigrated: 0,
    recordsFailed: 0,
    migrationType: 'ACTIVITIES',
    status: 'COMPLETED',
    id: '2022-03-14T10:13:56',
    isNew: false,
  },
  {
    migrationId: '2022-03-14T11:45:12',
    whenStarted: '2022-03-14T11:45:12.615759',
    estimatedRecordCount: 205630,
    filter: '{"prisonId": "WWI", "courseActivityId": 123456}',
    recordsMigrated: 1,
    recordsFailed: 162794,
    migrationType: 'ACTIVITIES',
    status: 'STARTED',
    id: '2022-03-14T11:45:12',
    isNew: false,
  },
  {
    migrationId: '2022-03-15T11:00:35',
    whenStarted: '2022-03-15T11:00:35.406626',
    whenEnded: '2022-03-15T11:00:45.990485',
    estimatedRecordCount: 4,
    filter: '{"prisonId": "WWI"}',
    recordsMigrated: 0,
    recordsFailed: 3,
    migrationType: 'ACTIVITIES',
    status: 'COMPLETED',
    id: '2022-03-15T11:00:35',
    isNew: false,
  },
]

const activitiesFailures = {
  messagesFoundCount: 353,
  messagesReturnedCount: 5,
  messages: [
    {
      body: {
        context: {
          migrationId: '2022-03-23T16:12:43',
          estimatedCount: 93,
          body: {
            courseActivityId: 123456,
          },
        },
        type: 'MIGRATE_ACTIVITIES',
      },
      messageId: 'afeb75fd-a2aa-41c4-9ede-b6bfe9590d36',
    },
    {
      body: {
        context: {
          migrationId: '2022-03-23T16:12:43',
          estimatedCount: 93,
          body: {
            courseActivityId: 123457,
          },
        },
        type: 'MIGRATE_ACTIVITIES',
      },
      messageId: '86b96f0e-2ac3-445c-b3ac-0a4d525d371e',
    },
    {
      body: {
        context: {
          migrationId: '2022-03-24T13:39:33',
          estimatedCount: 292,
          body: {
            courseActivityId: 123458,
          },
        },
        type: 'MIGRATE_ACTIVITIES',
      },
      messageId: '7e37a1e0-f041-42bc-9c2d-1da82d3bb83b',
    },
    {
      body: {
        context: {
          migrationId: '2022-03-24T13:39:33',
          estimatedCount: 292,
          body: {
            courseActivityId: 123459,
          },
        },
        type: 'MIGRATE_ACTIVITIES',
      },
      messageId: '8d87f4d7-7846-48b2-ae93-5a7878dba502',
    },
    {
      body: {
        context: {
          migrationId: '2022-03-24T13:39:33',
          estimatedCount: 292,
          body: {
            courseActivityId: 123460,
          },
        },
        type: 'MIGRATE_ACTIVITIES',
      },
      messageId: '230dcb1f-3391-4630-b907-3923ec9e0ee4',
    },
  ],
}

const stubGetActivitiesWithFailures = (failures: unknown = activitiesFailures): SuperAgentRequest =>
  stubFor({
    request: {
      method: 'GET',
      urlPattern: '/nomis-migration-api/queue-admin/get-dlq-messages/dps-syscon-dev-activitiesmigration_dlq',
    },
    response: {
      status: 200,
      headers: {
        'Content-Type': 'application/json;charset=UTF-8',
      },
      jsonBody: failures,
    },
  })

const stubDeleteActivitiesFailures = (): SuperAgentRequest =>
  stubFor({
    request: {
      method: 'PUT',
      urlPattern: '/nomis-migration-api/queue-admin/purge-queue/dps-syscon-dev-activitiesmigration_dlq',
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

const stubGetActivitiesMigrationDetailsStarted = (migrationId: string): SuperAgentRequest =>
  stubFor({
    request: {
      method: 'GET',
      urlPattern: `/nomis-migration-api/migrate/activities/history/${migrationId}`,
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
        estimatedRecordCount: 202,
        filter: '{"prisonId":"MDI"}',
        recordsMigrated: 12091,
        recordsFailed: 123,
        migrationType: 'ACTIVITIES',
        status: 'STARTED',
        id: migrationId,
      },
    },
  })

const stubGetActivitiesMigrationDetailsCompleted = ({
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
      urlPattern: `/nomis-migration-api/migrate/activities/history/${migrationId}`,
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
        estimatedRecordCount: 202,
        filter: '{"prisonId":"MDI"}',
        recordsMigrated: migrated,
        recordsFailed: failed,
        migrationType: 'ACTIVITIES',
        status: 'COMPLETED',
        id: migrationId,
      },
    },
  })

const stubListOfAllocationsMigrationHistory = (
  migrationHistory: MigrationHistory[] = defaultAllocationsMigrationHistory,
): SuperAgentRequest =>
  stubFor({
    request: {
      method: 'GET',
      urlPattern: '/nomis-migration-api/migrate/allocations/history?.*',
    },
    response: {
      status: 200,
      headers: {
        'Content-Type': 'application/json;charset=UTF-8',
      },
      jsonBody: migrationHistory,
    },
  })

const stubEndActivities = (status: string): SuperAgentRequest =>
  stubFor({
    request: {
      method: 'PUT',
      urlPattern: '/nomis-migration-api/migrate/activities/.*/end',
    },
    response: {
      status,
    },
  })

const stubStartAllocationsMigration = (
  response: unknown = {
    migrationId: '2022-03-23T11:11:56',
    estimatedCount: 2,
    body: {
      prisonId: 'MDI',
    },
  },
): SuperAgentRequest =>
  stubFor({
    request: {
      method: 'POST',
      urlPattern: '/nomis-migration-api/migrate/allocations',
    },
    response: {
      status: 200,
      headers: { 'Content-Type': 'application/json;charset=UTF-8' },
      jsonBody: response,
    },
  })

const defaultAllocationsMigrationHistory: MigrationHistory[] = [
  {
    migrationId: '2022-03-14T10:13:56',
    whenStarted: '2022-03-14T10:13:56.878627',
    whenEnded: '2022-03-14T10:14:07.531409',
    estimatedRecordCount: 0,
    filter: '{"prisonId": "MDI"}',
    recordsMigrated: 0,
    recordsFailed: 0,
    migrationType: 'ALLOCATIONS',
    status: 'COMPLETED',
    id: '2022-03-14T10:13:56',
    isNew: false,
  },
  {
    migrationId: '2022-03-14T11:45:12',
    whenStarted: '2022-03-14T11:45:12.615759',
    estimatedRecordCount: 205630,
    filter: '{"prisonId": "WWI", "courseActivityId": 123456}',
    recordsMigrated: 1,
    recordsFailed: 162794,
    migrationType: 'ALLOCATIONS',
    status: 'STARTED',
    id: '2022-03-14T11:45:12',
    isNew: false,
  },
  {
    migrationId: '2022-03-15T11:00:35',
    whenStarted: '2022-03-15T11:00:35.406626',
    whenEnded: '2022-03-15T11:00:45.990485',
    estimatedRecordCount: 4,
    filter: '{"prisonId": "WWI"}',
    recordsMigrated: 0,
    recordsFailed: 3,
    migrationType: 'ALLOCATIONS',
    status: 'COMPLETED',
    id: '2022-03-15T11:00:35',
    isNew: false,
  },
]

const defaultAllocationsFailures = {
  messagesFoundCount: 353,
  messagesReturnedCount: 5,
  messages: [
    {
      body: {
        context: {
          migrationId: '2022-03-23T16:12:43',
          estimatedCount: 93,
          body: {
            courseActivityId: 123456,
          },
        },
        type: 'MIGRATE_ACTIVITIES',
      },
      messageId: 'afeb75fd-a2aa-41c4-9ede-b6bfe9590d36',
    },
    {
      body: {
        context: {
          migrationId: '2022-03-23T16:12:43',
          estimatedCount: 93,
          body: {
            courseActivityId: 123457,
          },
        },
        type: 'MIGRATE_ACTIVITIES',
      },
      messageId: '86b96f0e-2ac3-445c-b3ac-0a4d525d371e',
    },
    {
      body: {
        context: {
          migrationId: '2022-03-24T13:39:33',
          estimatedCount: 292,
          body: {
            courseActivityId: 123458,
          },
        },
        type: 'MIGRATE_ACTIVITIES',
      },
      messageId: '7e37a1e0-f041-42bc-9c2d-1da82d3bb83b',
    },
    {
      body: {
        context: {
          migrationId: '2022-03-24T13:39:33',
          estimatedCount: 292,
          body: {
            courseActivityId: 123459,
          },
        },
        type: 'MIGRATE_ACTIVITIES',
      },
      messageId: '8d87f4d7-7846-48b2-ae93-5a7878dba502',
    },
    {
      body: {
        context: {
          migrationId: '2022-03-24T13:39:33',
          estimatedCount: 292,
          body: {
            courseActivityId: 123460,
          },
        },
        type: 'MIGRATE_ACTIVITIES',
      },
      messageId: '230dcb1f-3391-4630-b907-3923ec9e0ee4',
    },
  ],
}

const stubGetAllocationsFailures = (failures: unknown = defaultAllocationsFailures): SuperAgentRequest =>
  stubFor({
    request: {
      method: 'GET',
      urlPattern: '/nomis-migration-api/queue-admin/get-dlq-messages/dps-syscon-dev-allocationsmigration_dlq',
    },
    response: {
      status: 200,
      headers: {
        'Content-Type': 'application/json;charset=UTF-8',
      },
      jsonBody: failures,
    },
  })

const stubDeleteAllocationsFailures = (): SuperAgentRequest =>
  stubFor({
    request: {
      method: 'PUT',
      urlPattern: '/nomis-migration-api/queue-admin/purge-queue/dps-syscon-dev-allocationsmigration_dlq',
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

const stubGetAllocationsMigrationDetailsStarted = (migrationId: string): SuperAgentRequest =>
  stubFor({
    request: {
      method: 'GET',
      urlPattern: `/nomis-migration-api/migrate/allocations/history/${migrationId}`,
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
        estimatedRecordCount: 202,
        filter: '{"prisonId":"MDI"}',
        recordsMigrated: 12091,
        recordsFailed: 123,
        migrationType: 'ALLOCATIONS',
        status: 'STARTED',
        id: migrationId,
      },
    },
  })

const stubGetAllocationsMigrationDetailsCompleted = ({
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
      urlPattern: `/nomis-migration-api/migrate/allocations/history/${migrationId}`,
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
        estimatedRecordCount: 202,
        filter: '{"prisonId":"MDI"}',
        recordsMigrated: migrated,
        recordsFailed: failed,
        migrationType: 'ALLOCATIONS',
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

const defaultIncidentsMigrationHistory: MigrationHistory[] = [
  {
    migrationId: '2022-03-14T10:13:56',
    whenStarted: '2022-03-14T10:13:56.878627',
    whenEnded: '2022-03-14T10:14:07.531409',
    estimatedRecordCount: 0,
    filter: '{"fromDate":"2022-03-04"}',
    recordsMigrated: 0,
    recordsFailed: 0,
    migrationType: 'INCIDENTS',
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
    migrationType: 'INCIDENTS',
    status: 'STARTED',
    id: '2022-03-14T11:45:12',
    isNew: false,
  },
  {
    migrationId: '2022-03-15T11:00:35',
    whenStarted: '2022-03-15T11:00:35.406626',
    whenEnded: '2022-03-15T11:00:45.990485',
    estimatedRecordCount: 4,
    filter: '{"toDate":"2022-04-17"}',
    recordsMigrated: 0,
    recordsFailed: 4,
    migrationType: 'INCIDENTS',
    status: 'COMPLETED',
    id: '2022-03-15T11:00:35',
    isNew: false,
  },
]
const stubListOfIncidentsMigrationHistory = (
  migrationHistory: MigrationHistory[] = defaultIncidentsMigrationHistory,
): SuperAgentRequest =>
  stubFor({
    request: {
      method: 'GET',
      urlPattern: '/nomis-migration-api/migrate/incidents/history?.*',
    },
    response: {
      status: 200,
      headers: {
        'Content-Type': 'application/json;charset=UTF-8',
      },
      jsonBody: migrationHistory,
    },
  })

const stubStartIncidentsMigration = (
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
      urlPattern: '/nomis-migration-api/migrate/incidents',
    },
    response: {
      status: 200,
      headers: { 'Content-Type': 'application/json;charset=UTF-8' },
      jsonBody: response,
    },
  })

const defaultIncidentsFailures = {
  messagesFoundCount: 353,
  messagesReturnedCount: 5,
  messages: [
    {
      body: {
        context: {
          migrationId: '2022-03-23T16:12:43',
          estimatedCount: 93,
          body: {
            nomisIncidentId: 10310112,
            sequence: 1,
          },
        },
        type: 'MIGRATE_INCIDENT_REPORTS',
      },
      messageId: 'afeb75fd-a2aa-41c4-9ede-b6bfe9590d36',
    },
    {
      body: {
        context: {
          migrationId: '2022-03-23T16:12:43',
          estimatedCount: 93,
          body: {
            nomisIncidentId: 10309678,
            sequence: 1,
          },
        },
        type: 'MIGRATE_INCIDENT_REPORTS',
      },
      messageId: '86b96f0e-2ac3-445c-b3ac-0a4d525d371e',
    },
    {
      body: {
        context: {
          migrationId: '2022-03-24T13:39:33',
          estimatedCount: 292,
          body: {
            nomisIncidentId: 10243234,
            sequence: 1,
          },
        },
        type: 'MIGRATE_INCIDENT_REPORTS',
      },
      messageId: '7e37a1e0-f041-42bc-9c2d-1da82d3bb83b',
    },
    {
      body: {
        context: {
          migrationId: '2022-03-24T13:39:33',
          estimatedCount: 292,
          body: {
            nomisIncidentId: 10243119,
            sequence: 1,
          },
        },
        type: 'MIGRATE_INCIDENT_REPORTS',
      },
      messageId: '8d87f4d7-7846-48b2-ae93-5a7878dba502',
    },
    {
      body: {
        context: {
          migrationId: '2022-03-24T13:39:33',
          estimatedCount: 292,
          body: {
            nomisIncidentId: 10245176,
            sequence: 1,
          },
        },
        type: 'MIGRATE_INCIDENT_REPORTS',
      },
      messageId: '230dcb1f-3391-4630-b907-3923ec9e0ee4',
    },
  ],
}

const stubGetIncidentsFailures = (failures: unknown = defaultIncidentsFailures): SuperAgentRequest =>
  stubFor({
    request: {
      method: 'GET',
      urlPattern: '/nomis-migration-api/queue-admin/get-dlq-messages/dps-syscon-dev-incidentsmigration_dlq',
    },
    response: {
      status: 200,
      headers: {
        'Content-Type': 'application/json;charset=UTF-8',
      },
      jsonBody: failures,
    },
  })

const stubDeleteIncidentsFailures = (): SuperAgentRequest =>
  stubFor({
    request: {
      method: 'PUT',
      urlPattern: '/nomis-migration-api/queue-admin/purge-queue/dps-syscon-dev-incidentsmigration_dlq',
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

const stubGetIncidentsMigrationDetailsStarted = (migrationId: string): SuperAgentRequest =>
  stubFor({
    request: {
      method: 'GET',
      urlPattern: `/nomis-migration-api/migrate/incidents/history/${migrationId}`,
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
        estimatedRecordCount: 202,
        filter: '{"fromDate":"2016-03-23"}',
        recordsMigrated: 12091,
        recordsFailed: 123,
        migrationType: 'INCIDENTS',
        status: 'STARTED',
        id: migrationId,
      },
    },
  })

const stubGetIncidentsMigrationDetailsCompleted = ({
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
      urlPattern: `/nomis-migration-api/migrate/incidents/history/${migrationId}`,
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
        estimatedRecordCount: 202,
        filter: '{"fromDate":"2016-03-23"}',
        recordsMigrated: migrated,
        recordsFailed: failed,
        migrationType: 'INCIDENTS',
        status: 'COMPLETED',
        id: migrationId,
      },
    },
  })

/// CSIP ////////////////////////////////////////////////////

const defaultCSIPMigrationHistory: MigrationHistory[] = [
  {
    migrationId: '2022-03-14T10:13:56',
    whenStarted: '2022-03-14T10:13:56.878627',
    whenEnded: '2022-03-14T10:14:07.531409',
    estimatedRecordCount: 0,
    filter: '{"fromDate":"2022-03-04"}',
    recordsMigrated: 0,
    recordsFailed: 0,
    migrationType: 'CSIP',
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
    migrationType: 'CSIP',
    status: 'STARTED',
    id: '2022-03-14T11:45:12',
    isNew: false,
  },
  {
    migrationId: '2022-03-15T11:00:35',
    whenStarted: '2022-03-15T11:00:35.406626',
    whenEnded: '2022-03-15T11:00:45.990485',
    estimatedRecordCount: 4,
    filter: '{"toDate":"2022-04-17"}',
    recordsMigrated: 0,
    recordsFailed: 4,
    migrationType: 'CSIP',
    status: 'COMPLETED',
    id: '2022-03-15T11:00:35',
    isNew: false,
  },
]
const stubListOfCSIPMigrationHistory = (
  migrationHistory: MigrationHistory[] = defaultCSIPMigrationHistory,
): SuperAgentRequest =>
  stubFor({
    request: {
      method: 'GET',
      urlPattern: `/nomis-migration-api/migrate/csip/history?.*`,
    },
    response: {
      status: 200,
      headers: {
        'Content-Type': 'application/json;charset=UTF-8',
      },
      jsonBody: migrationHistory,
    },
  })

const stubStartCSIPMigration = (
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
      urlPattern: '/nomis-migration-api/migrate/csip',
    },
    response: {
      status: 200,
      headers: { 'Content-Type': 'application/json;charset=UTF-8' },
      jsonBody: response,
    },
  })

const defaultCSIPFailures = {
  messagesFoundCount: 353,
  messagesReturnedCount: 5,
  messages: [
    {
      body: {
        context: {
          migrationId: '2022-03-23T16:12:43',
          estimatedCount: 93,
          body: {
            nomisCSIPId: 10310112,
            sequence: 1,
          },
        },
        type: 'MIGRATE_CSIP',
      },
      messageId: 'afeb75fd-a2aa-41c4-9ede-b6bfe9590d36',
    },
    {
      body: {
        context: {
          migrationId: '2022-03-23T16:12:43',
          estimatedCount: 93,
          body: {
            nomisCSIPId: 10309678,
            sequence: 1,
          },
        },
        type: 'MIGRATE_CSIP',
      },
      messageId: '86b96f0e-2ac3-445c-b3ac-0a4d525d371e',
    },
    {
      body: {
        context: {
          migrationId: '2022-03-24T13:39:33',
          estimatedCount: 292,
          body: {
            nomisCSIPId: 10243234,
            sequence: 1,
          },
        },
        type: 'MIGRATE_CSIP',
      },
      messageId: '7e37a1e0-f041-42bc-9c2d-1da82d3bb83b',
    },
    {
      body: {
        context: {
          migrationId: '2022-03-24T13:39:33',
          estimatedCount: 292,
          body: {
            nomisCSIPId: 10243119,
            sequence: 1,
          },
        },
        type: 'MIGRATE_CSIP',
      },
      messageId: '8d87f4d7-7846-48b2-ae93-5a7878dba502',
    },
    {
      body: {
        context: {
          migrationId: '2022-03-24T13:39:33',
          estimatedCount: 292,
          body: {
            nomisCSIPId: 10245176,
            sequence: 1,
          },
        },
        type: 'MIGRATE_CSIP',
      },
      messageId: '230dcb1f-3391-4630-b907-3923ec9e0ee4',
    },
  ],
}

const stubGetCSIPFailures = (failures: unknown = defaultCSIPFailures): SuperAgentRequest =>
  stubFor({
    request: {
      method: 'GET',
      urlPattern: '/nomis-migration-api/queue-admin/get-dlq-messages/dps-syscon-dev-csipmigration_dlq',
    },
    response: {
      status: 200,
      headers: {
        'Content-Type': 'application/json;charset=UTF-8',
      },
      jsonBody: failures,
    },
  })

const stubDeleteCSIPFailures = (): SuperAgentRequest =>
  stubFor({
    request: {
      method: 'PUT',
      urlPattern: '/nomis-migration-api/queue-admin/purge-queue/dps-syscon-dev-csipmigration_dlq',
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

const stubGetCSIPMigrationDetailsStarted = (migrationId: string): SuperAgentRequest =>
  stubFor({
    request: {
      method: 'GET',
      urlPattern: `/nomis-migration-api/migrate/csip/history/${migrationId}`,
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
        estimatedRecordCount: 202,
        filter: '{"fromDate":"2016-03-23"}',
        recordsMigrated: 12091,
        recordsFailed: 123,
        migrationType: 'CSIP',
        status: 'STARTED',
        id: migrationId,
      },
    },
  })

const stubGetCSIPMigrationDetailsCompleted = ({
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
      urlPattern: `/nomis-migration-api/migrate/csip/history/${migrationId}`,
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
        estimatedRecordCount: 202,
        filter: '{"fromDate":"2016-03-23"}',
        recordsMigrated: migrated,
        recordsFailed: failed,
        migrationType: 'CSIP',
        status: 'COMPLETED',
        id: migrationId,
      },
    },
  })

// Contact Person Profile Details //

const stubGetContactPersonProfileDetailsMigrationDetailsStarted = (migrationId: string): SuperAgentRequest =>
  stubFor({
    request: {
      method: 'GET',
      urlPattern: `/nomis-migration-api/migrate/contact-person-profile-details/history/${migrationId}`,
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
        estimatedRecordCount: 202,
        filter: '{"prisonerNumber":"A1234BC"}',
        recordsMigrated: 12091,
        recordsFailed: 123,
        migrationType: 'PERSONALRELATIONSHIPS_PROFILEDETAIL',
        status: 'STARTED',
        id: migrationId,
      },
    },
  })

const stubGetContactPersonProfileDetailsMigrationDetailsCompleted = ({
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
      urlPattern: `/nomis-migration-api/migrate/contact-person-profile-details/history/${migrationId}`,
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
        estimatedRecordCount: 202,
        filter: '{"prisonerNumber":"A1234BC"}',
        recordsMigrated: migrated,
        recordsFailed: failed,
        migrationType: 'PERSONALRELATIONSHIPS_PROFILEDETAIL',
        status: 'COMPLETED',
        id: migrationId,
      },
    },
  })

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

const stubDeleteContactPersonProfileDetailsFailures = (): SuperAgentRequest =>
  stubFor({
    request: {
      method: 'PUT',
      urlPattern:
        '/nomis-migration-api/queue-admin/purge-queue/dps-syscon-dev-migration_personalrelationships_profiledetails_dlq',
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

// GENERIC //

const stubListOfMigrationHistory = ({
  domain,
  history = defaultSentencingMigrationHistory,
}: {
  domain: string
  history: MigrationHistory[]
}): SuperAgentRequest =>
  stubFor({
    request: {
      method: 'GET',
      urlPattern: `/nomis-migration-api/migrate/${domain}/history?.*`,
    },
    response: {
      status: 200,
      headers: {
        'Content-Type': 'application/json;charset=UTF-8',
      },
      jsonBody: history,
    },
  })

const stubGetMigrationHistory = ({
  migrationType,
  history = defaultSentencingMigrationHistory,
}: {
  migrationType: string
  history: MigrationHistory[]
}): SuperAgentRequest =>
  stubFor({
    request: {
      method: 'GET',
      urlPattern: `/nomis-migration-api/migrate/history/all/${migrationType}`,
    },
    response: {
      status: 200,
      headers: {
        'Content-Type': 'application/json;charset=UTF-8',
      },
      jsonBody: history,
    },
  })

const stubGetMigration = ({
  migrationId,
  migrationType,
  filter = null,
  migrated = 12091,
  failed = 123,
  whenEnded = null,
  status = 'STARTED',
}: {
  migrationType: string
  migrationId: string
  filter: string
  migrated: number
  failed: number
  whenEnded: string
  status: string
}): SuperAgentRequest =>
  stubFor({
    request: {
      method: 'GET',
      urlPattern: `/nomis-migration-api/migrate/history/${migrationId}`,
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
        estimatedRecordCount: 202,
        filter,
        recordsMigrated: migrated,
        recordsFailed: failed,
        migrationType,
        status,
        id: migrationId,
      },
    },
  })

const stubGetActiveMigration = ({
  migrationType,
  migrationId,
  migrated,
  failed,
  stillToBeProcessed,
  status = 'STARTED',
}: {
  migrationType: string
  migrationId: string
  migrated: number
  failed: string
  stillToBeProcessed: string
  status: string
}): SuperAgentRequest =>
  stubFor({
    request: {
      method: 'GET',
      urlPattern: `/nomis-migration-api/migrate/history/active/${migrationType}`,
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
        migrationId,
        whenStarted: '2023-05-02T11:07:09.719517',
        estimatedRecordCount: 6,
        migrationType,
        status,
      },
    },
  })

const stubStartMigration = (args: { domain: string; response: unknown }): SuperAgentRequest =>
  stubFor({
    request: {
      method: 'POST',
      urlPattern: `/nomis-migration-api/migrate/${args.domain}`,
    },
    response: {
      status: 200,
      headers: { 'Content-Type': 'application/json;charset=UTF-8' },
      jsonBody: args.response,
    },
  })

const stubGetFailures = (args: { queue: string; failures: unknown }): SuperAgentRequest =>
  stubFor({
    request: {
      method: 'GET',
      urlPattern: `/nomis-migration-api/queue-admin/get-dlq-messages/${args.queue}`,
    },
    response: {
      status: 200,
      headers: {
        'Content-Type': 'application/json;charset=UTF-8',
      },
      jsonBody: args.failures || defaultFailures,
    },
  })

const stubGetNoFailures = (args: { queue: string }): SuperAgentRequest =>
  stubGetFailures({ queue: args.queue, failures: noMessageFailures })

const noMessageFailures = {
  messagesFoundCount: 0,
  messagesReturnedCount: 0,
  messages: [],
}

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

  stubListOfActivitiesMigrationHistory,
  stubStartActivitiesMigration,
  stubGetActivitiesWithFailures,
  stubDeleteActivitiesFailures,
  stubGetActivitiesMigrationDetailsStarted,
  stubGetActivitiesMigrationDetailsCompleted,
  stubEndActivities,

  stubListOfAllocationsMigrationHistory,
  stubStartAllocationsMigration,
  stubGetAllocationsFailures,
  stubDeleteAllocationsFailures,
  stubGetAllocationsMigrationDetailsStarted,
  stubGetAllocationsMigrationDetailsCompleted,

  stubListOfIncidentsMigrationHistory,
  stubStartIncidentsMigration,
  stubGetIncidentsFailures,
  stubDeleteIncidentsFailures,
  stubGetIncidentsMigrationDetailsStarted,
  stubGetIncidentsMigrationDetailsCompleted,

  stubListOfCSIPMigrationHistory,
  stubStartCSIPMigration,
  stubGetCSIPFailures,
  stubDeleteCSIPFailures,
  stubGetCSIPMigrationDetailsStarted,
  stubGetCSIPMigrationDetailsCompleted,

  stubGetContactPersonProfileDetailsMigrationDetailsStarted,
  stubGetContactPersonProfileDetailsMigrationDetailsCompleted,
  stubStartContactPersonProfileDetailsMigration,
  stubDeleteContactPersonProfileDetailsFailures,

  stubNomisMigrationPing,
  stubHealth,
  stubMigrationInProgress,
  stubMigrationInProgressCompleted,
  stubGetVisitMigrationRoomUsage,
  stubListOfMigrationHistory,
  stubGetMigrationHistory,
  stubGetMigration,
  stubGetActiveMigration,
  stubStartMigration,
  stubGetFailures,
  stubGetNoFailures,
}
