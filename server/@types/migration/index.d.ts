import { components } from '../migrationImport'

export type MigrationHistory = components['schemas']['MigrationHistory']
export type InProgressMigration = components['schemas']['InProgressMigration']

export type VisitsMigrationFilter = components['schemas']['VisitsMigrationFilter']
export type MigrationContextVisitsMigrationFilter = components['schemas']['MigrationContextVisitsMigrationFilter']

export type SentencingMigrationFilter = components['schemas']['SentencingMigrationFilter']
export type MigrationContextSentencingMigrationFilter =
  components['schemas']['MigrationContextSentencingMigrationFilter']

export type AppointmentsMigrationFilter = components['schemas']['AppointmentsMigrationFilter']
export type AdjudicationsMigrationFilter = components['schemas']['AdjudicationsMigrationFilter']
export type MigrationContextAppointmentsMigrationFilter =
  components['schemas']['MigrationContextAppointmentsMigrationFilter']
export type MigrationContextAdjudicationsMigrationFilter =
  components['schemas']['MigrationContextAdjudicationsMigrationFilter']

export type GetDlqResult = components['schemas']['GetDlqResult']
export type PurgeQueueResult = components['schemas']['PurgeQueueResult']
export type RoomMappingsResponse = components['schemas']['VisitRoomUsageResponse']
