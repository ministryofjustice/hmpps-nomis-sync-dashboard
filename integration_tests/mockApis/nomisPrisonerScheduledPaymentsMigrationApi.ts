import { MigrationHistory } from '../../server/@types/migration'

const scheduledPaymentsMigrationHistory: MigrationHistory[] = [
  {
    migrationId: '2026-10-28T10:13:56',
    whenStarted: '2026-10-28T10:13:56.878627',
    whenEnded: '2026-10-28T10:14:07.531409',
    estimatedRecordCount: 0,
    filter: '{}',
    recordsMigrated: 0,
    recordsFailed: 0,
    migrationType: 'FINANCE_SCHEDULED_PAYMENTS',
    status: 'COMPLETED',
    id: '2026-10-28T10:13:56',
    isNew: false,
  },
  {
    migrationId: '2026-10-28T11:45:12',
    whenStarted: '2026-10-28T11:45:12.615759',
    estimatedRecordCount: 205,
    filter: '{}',
    recordsMigrated: 1,
    recordsFailed: 162,
    migrationType: 'FINANCE_SCHEDULED_PAYMENTS',
    status: 'STARTED',
    id: '2026-10-28T11:45:12',
    isNew: false,
  },
  {
    migrationId: '2026-10-29T11:00:35',
    whenStarted: '2026-10-29T11:00:35.406626',
    whenEnded: '2026-10-29T11:00:45.990485',
    estimatedRecordCount: 4,
    filter: '{}',
    recordsMigrated: 0,
    recordsFailed: 4,
    migrationType: 'FINANCE_SCHEDULED_PAYMENTS',
    status: 'COMPLETED',
    id: '2026-10-29T11:00:35',
    isNew: false,
  },
]

export const scheduledPaymentFailures = {
  messagesFoundCount: 2,
  messagesReturnedCount: 2,
  messages: [
    {
      body: {
        context: {
          migrationId: '2026-10-29T11:00:35',
          estimatedCount: 4,
          body: {
            prisonNumber: 'A1234AA',
            rootOffenderId: 10001,
          },
        },
        type: 'MIGRATE_FINANCE_SCHEDULED_PAYMENTS',
      },
      messageId: 'd70d0fc3-476f-4c74-ae37-e69ce5ce6410',
    },
    {
      body: {
        context: {
          migrationId: '2026-10-29T11:00:35',
          estimatedCount: 4,
          body: {
            prisonNumber: 'A1234AB',
            rootOffenderId: 10002,
          },
        },
        type: 'MIGRATE_FINANCE_SCHEDULED_PAYMENTS',
      },
      messageId: '1c3b1264-d882-4203-8b2e-32f8c6699e63',
    },
  ],
}

export default scheduledPaymentsMigrationHistory
