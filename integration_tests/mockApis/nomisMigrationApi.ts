import { SuperAgentRequest } from 'superagent'
import { stubFor } from './wiremock'
import { MigrationHistory } from '../../server/@types/migration'
import { sentencingMigrationHistory } from './nomisSentencingMigrationApi'

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

// Contact Person Profile Details //

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

// GENERIC //

const stubListOfMigrationHistory = ({
  domain,
  history = sentencingMigrationHistory,
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
  history = sentencingMigrationHistory,
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

const stubGetMigrationCompleted = ({
  migrationType,
  migrationId,
  migrated = 2000,
  failed = 101,
  whenEnded = '2022-03-28T14:59:24.657071',
  filter,
}: {
  migrationType: string
  migrationId: string
  migrated: number
  failed: number
  whenEnded: string
  filter: string
}): SuperAgentRequest =>
  stubGetMigration({
    migrationType,
    migrationId,
    filter,
    migrated,
    failed,
    whenEnded,
    status: 'COMPLETED',
  })

const stubGetActiveMigration = ({
  migrationType,
  migrationId,
  migrated = 1000,
  failed = 100,
  stillToBeProcessed = 23100,
  status = 'STARTED',
}: {
  migrationType: string
  migrationId: string
  migrated: number
  failed: number
  stillToBeProcessed: number
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

const stubGetActiveMigrationCompleted = ({
  migrationType,
  migrationId,
}: {
  migrationType: string
  migrationId: string
}): SuperAgentRequest =>
  stubGetActiveMigration({
    migrationType,
    migrationId,
    migrated: 0,
    failed: 999,
    status: 'COMPLETED',
    stillToBeProcessed: 0,
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

const stubGetFailuresWithMigrationType = ({
  migrationType,
  failures = defaultFailures,
}: {
  migrationType: string
  failures: unknown
}): SuperAgentRequest =>
  stubFor({
    request: {
      method: 'GET',
      urlPattern: `/nomis-migration-api/migrate/dead-letter-queue/${migrationType}`,
    },
    response: {
      status: 200,
      headers: {
        'Content-Type': 'application/json;charset=UTF-8',
      },
      jsonBody: failures,
    },
  })

const stubGetNoFailuresWithMigrationType = ({ migrationType }: { migrationType: string }): SuperAgentRequest =>
  stubGetFailuresWithMigrationType({ migrationType, failures: noMessageFailures })

const stubGetFailureCountWithMigrationType = ({
  migrationType,
  failures = 153,
}: {
  migrationType: string
  failures: number
}): SuperAgentRequest =>
  stubFor({
    request: {
      method: 'GET',
      urlPattern: `/nomis-migration-api/migrate/dead-letter-queue/${migrationType}/count`,
    },
    response: {
      status: 200,
      headers: {
        'Content-Type': 'application/json;charset=UTF-8',
      },
      jsonBody: failures,
    },
  })

const stubDeleteFailuresWithMigrationType = ({ migrationType }: { migrationType: string }): SuperAgentRequest =>
  stubFor({
    request: {
      method: 'DELETE',
      urlPattern: `/nomis-migration-api/migrate/dead-letter-queue/${migrationType}`,
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

  stubStartSentencingMigration,

  stubStartContactPersonProfileDetailsMigration,

  stubNomisMigrationPing,
  stubHealth,
  stubMigrationInProgress,
  stubMigrationInProgressCompleted,
  stubGetVisitMigrationRoomUsage,
  stubListOfMigrationHistory,
  stubGetMigrationHistory,
  stubGetMigration,
  stubGetMigrationCompleted,
  stubGetActiveMigration,
  stubGetActiveMigrationCompleted,
  stubStartMigration,
  stubGetFailures,
  stubGetNoFailures,
  stubGetFailuresWithMigrationType,
  stubGetNoFailuresWithMigrationType,
  stubGetFailureCountWithMigrationType,
  stubDeleteFailuresWithMigrationType,
}
