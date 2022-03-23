import { SuperAgentRequest } from 'superagent'
import { stubFor } from './wiremock'
import { MigrationHistory } from '../../server/@types/migration'

const stubListOfMigrationHistory = (
  migrationHistory: MigrationHistory[] = defaultMigrationHistory
): SuperAgentRequest =>
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

export default {
  stubListOfMigrationHistory,
  stubNomisMigrationPing,
}
