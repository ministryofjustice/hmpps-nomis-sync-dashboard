import { SuperAgentRequest } from 'superagent'
import { stubFor } from './wiremock'
import { MigrationHistory } from '../../server/@types/migration'
import { sentencingMigrationHistory } from './nomisSentencingMigrationApi'

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
      urlPattern: `/nomis-migration-api/migrate/history/all/${migrationType}.*`,
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
  stubNomisMigrationPing,
  stubGetMigrationHistory,
  stubGetMigration,
  stubGetMigrationCompleted,
  stubGetActiveMigration,
  stubGetActiveMigrationCompleted,
  stubStartMigration,
  stubGetFailuresWithMigrationType,
  stubGetNoFailuresWithMigrationType,
  stubGetFailureCountWithMigrationType,
  stubDeleteFailuresWithMigrationType,
}
