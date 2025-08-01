import { SuperAgentRequest } from 'superagent'
import moment from 'moment'
import { MigrationHistory } from '../../server/@types/migration'
import { stubFor } from './wiremock'

export const activitiesMigrationHistory: MigrationHistory[] = [
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
    filter: `{"prisonId": "WWI", "courseActivityId": 123456, "activityStartDate": "${moment().add(2, 'days').format('YYYY-MM-DD')}"}`,
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

export const activitiesFailures = {
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

const stubGetActivityMigration = ({
  response,
  status,
}: {
  response: MigrationHistory
  status: string
  warnings?: string[]
}): SuperAgentRequest =>
  stubFor({
    request: {
      method: 'GET',
      urlPattern: '/nomis-migration-api/migrate/history/.*',
    },
    response: {
      status,
      headers: { 'Content-Type': 'application/json;charset=UTF-8' },
      jsonBody: response,
    },
  })

const stubMoveStartDate = ({ status, warnings = [] }: { status: string; warnings?: string[] }): SuperAgentRequest =>
  stubFor({
    request: {
      method: 'PUT',
      urlPattern: '/nomis-migration-api/migrate/activities/.*/move-start-dates',
    },
    response: {
      status,
      headers: { 'Content-Type': 'application/json;charset=UTF-8' },
      jsonBody: warnings,
    },
  })

export default {
  stubStartActivitiesMigration,
  stubEndActivities,
  stubMoveStartDate,
  stubGetActivityMigration,
}
