import { components } from '../migrationImport'

export type MigrationHistory = components['schemas']['MigrationHistory']

export type VisitsMigrationFilter = components['schemas']['VisitsMigrationFilter']
export type MigrationContextVisitsMigrationFilter = components['schemas']['MigrationContextVisitsMigrationFilter']

export type SentencingMigrationFilter = components['schemas']['SentencingMigrationFilter']
export type MigrationContextSentencingMigrationFilter =
  components['schemas']['MigrationContextSentencingMigrationFilter']

export type AppointmentsMigrationFilter = components['schemas']['AppointmentsMigrationFilter']
export type MigrationContextAppointmentsMigrationFilter =
  components['schemas']['MigrationContextAppointmentsMigrationFilter']

export type GetDlqResult = components['schemas']['GetDlqResult']
export type PurgeQueueResult = components['schemas']['PurgeQueueResult']
export type RoomMappingsResponse = components['schemas']['VisitRoomUsageResponse']
