import { MigrationHistory } from '../../server/@types/migration'

const prisonerAdvancesMigrationHistory: MigrationHistory[] = [
  {
    migrationId: '2026-10-01T10:13:56',
    whenStarted: '2026-10-01T10:13:56.878627',
    whenEnded: '2026-10-01T10:14:07.531409',
    estimatedRecordCount: 0,
    filter: '{}',
    recordsMigrated: 0,
    recordsFailed: 0,
    migrationType: 'PRISONER_ADVANCES',
    status: 'COMPLETED',
    id: '2026-10-01T10:13:56',
    isNew: false,
  },
  {
    migrationId: '2026-10-02T11:45:12',
    whenStarted: '2026-10-02T11:45:12.615759',
    estimatedRecordCount: 205,
    filter: '{}',
    recordsMigrated: 1,
    recordsFailed: 162,
    migrationType: 'PRISONER_ADVANCES',
    status: 'STARTED',
    id: '2026-10-02T11:45:12',
    isNew: false,
  },
  {
    migrationId: '2026-10-03T11:00:35',
    whenStarted: '2026-10-03T11:00:35.406626',
    whenEnded: '2026-10-03T11:00:45.990485',
    estimatedRecordCount: 4,
    filter: '{}',
    recordsMigrated: 0,
    recordsFailed: 4,
    migrationType: 'PRISONER_ADVANCES',
    status: 'COMPLETED',
    id: '2026-10-03T11:00:35',
    isNew: false,
  },
]

export const prisonerAdvancesFailures = {
  messagesFoundCount: 2,
  messagesReturnedCount: 2,
  messages: [
    {
      body: {
        context: {
          migrationId: '2026-10-03T11:00:35',
          estimatedCount: 4,
          body: {
            advanceId: 10001,
          },
        },
        type: 'MIGRATE_PRISONER_ADVANCES',
      },
      messageId: 'd70d0fc3-476f-4c74-ae37-e69ce5ce6410',
    },
    {
      body: {
        context: {
          migrationId: '2026-10-03T11:00:35',
          estimatedCount: 4,
          body: {
            advanceId: 10002,
          },
        },
        type: 'MIGRATE_PRISONER_ADVANCES',
      },
      messageId: '1c3b1264-d882-4203-8b2e-32f8c6699e63',
    },
  ],
}

export default prisonerAdvancesMigrationHistory
