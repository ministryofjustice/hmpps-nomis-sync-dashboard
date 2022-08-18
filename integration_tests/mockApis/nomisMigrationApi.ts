import { SuperAgentRequest } from 'superagent'
import { stubFor } from './wiremock'
import { MigrationHistory } from '../../server/@types/migration'

const stubListOfMigrationHistory = (
  migrationHistory: MigrationHistory[] = defaultMigrationHistory
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
  }
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

const defaultMigrationHistory: MigrationHistory[] = [
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
  },
]

const defaultFailures = {
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
              queueName: 'dps-syscon-dev-migration_queue',
              messagesOnQueue: '0',
              messagesInFlight: '0',
              dlqStatus: 'UP',
              dlqName: 'dps-syscon-dev-migration_dlq',
              messagesOnDlq: '153',
            },
          },
        },
        groups: ['liveness', 'readiness'],
      },
    },
  })

const stubGetFailures = (failures: unknown = defaultFailures): SuperAgentRequest =>
  stubFor({
    request: {
      method: 'GET',
      urlPattern: '/nomis-migration-api/queue-admin/get-dlq-messages/dps-syscon-dev-migration_dlq',
    },
    response: {
      status: 200,
      headers: {
        'Content-Type': 'application/json;charset=UTF-8',
      },
      jsonBody: failures,
    },
  })

const stubDeleteFailures = (failures: unknown = defaultFailures): SuperAgentRequest =>
  stubFor({
    request: {
      method: 'PUT',
      urlPattern: '/nomis-migration-api/queue-admin/purge-queue/dps-syscon-dev-migration_dlq',
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

const stubGetMigrationDetailsStarted = (migrationId: string): SuperAgentRequest =>
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

const stubInfoInProgress = ({
  migrationId,
  migrated,
  failed,
  stillToBeProcessed,
}: {
  migrationId: string
  migrated: number
  failed: string
  stillToBeProcessed: string
}): SuperAgentRequest =>
  stubFor({
    request: {
      method: 'GET',
      urlPattern: '/nomis-migration-api/info',
    },
    response: {
      status: 200,
      headers: {
        'Content-Type': 'application/json;charset=UTF-8',
      },
      jsonBody: {
        git: {
          branch: 'main',
          commit: {
            id: '909b9e9',
            time: '2022-03-28T09:48:07Z',
          },
        },
        build: {
          operatingSystem: 'Linux (5.4.0-1021-gcp)',
          version: '2022-03-28.585.909b9e9',
          artifact: 'hmpps-prisoner-from-nomis-migration',
          machine: '07616ee6ca3c',
          by: 'root',
          name: 'hmpps-prisoner-from-nomis-migration',
          time: '2022-03-28T09:51:17.920Z',
          group: 'uk.gov.justice.digital.hmpps',
        },
        'last visits migration': {
          'records waiting processing': stillToBeProcessed,
          'records currently being processed': '24',
          'records that have failed': failed,
          id: migrationId,
          'records migrated': migrated,
          started: '2022-03-14T13:10:54.073256',
        },
      },
    },
  })

const stubGetMigrationDetailsCompleted = ({
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

const stubInfoCompleted = (migrationId: string): SuperAgentRequest =>
  stubFor({
    request: {
      method: 'GET',
      urlPattern: '/nomis-migration-api/info',
    },
    response: {
      status: 200,
      headers: {
        'Content-Type': 'application/json;charset=UTF-8',
      },
      jsonBody: {
        git: {
          branch: 'main',
          commit: {
            id: '909b9e9',
            time: '2022-03-28T09:48:07Z',
          },
        },
        build: {
          operatingSystem: 'Linux (5.4.0-1021-gcp)',
          version: '2022-03-28.585.909b9e9',
          artifact: 'hmpps-prisoner-from-nomis-migration',
          machine: '07616ee6ca3c',
          by: 'root',
          name: 'hmpps-prisoner-from-nomis-migration',
          time: '2022-03-28T09:51:17.920Z',
          group: 'uk.gov.justice.digital.hmpps',
        },
        'last visits migration': {
          'records waiting processing': '0',
          'records currently being processed': '0',
          'records that have failed': '999',
          id: migrationId,
          'records migrated': 999,
          started: '2022-03-14T13:10:54.073256',
        },
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
  stubListOfMigrationHistory,
  stubNomisMigrationPing,
  stubStartVisitsMigration,
  stubGetFailures,
  stubDeleteFailures,
  stubHealth,
  stubGetMigrationDetailsStarted,
  stubGetMigrationDetailsCompleted,
  stubInfoInProgress,
  stubInfoCompleted,
  stubGetVisitMigrationRoomUsage,
}
