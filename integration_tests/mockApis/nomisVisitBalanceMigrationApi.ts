import { SuperAgentRequest } from 'superagent'
import { MigrationHistory } from '../../server/@types/migration'
import { stubFor } from './wiremock'

export const visitBalanceMigrationHistory: MigrationHistory[] = [
  {
    migrationId: '2022-03-14T10:13:56',
    whenStarted: '2022-03-14T10:13:56.878627',
    whenEnded: '2022-03-14T10:14:07.531409',
    estimatedRecordCount: 0,
    filter: '{"prisonId":"HEI"}',
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
    filter: '{}',
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
    filter: '{}',
    recordsMigrated: 0,
    recordsFailed: 4,
    migrationType: 'VISITS',
    status: 'COMPLETED',
    id: '2022-03-15T11:00:35',
    isNew: false,
  },
]

const stubGetVisitBalanceMigrationDetailsStarted = (migrationId: string): SuperAgentRequest =>
  stubFor({
    request: {
      method: 'GET',
      urlPattern: `/nomis-migration-api/migrate/visit-balance/history/${migrationId}`,
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
        migrationType: 'VISIT_BALANCE',
        status: 'STARTED',
        id: migrationId,
      },
    },
  })

const stubGetVisitBalanceMigrationDetailsCompleted = ({
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
      urlPattern: `/nomis-migration-api/migrate/visit-balance/history/${migrationId}`,
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
        migrationType: 'VISIT_BALANCE',
        status: 'COMPLETED',
        id: migrationId,
      },
    },
  })

export default {
  stubGetVisitBalanceMigrationDetailsStarted,
  stubGetVisitBalanceMigrationDetailsCompleted,
}
