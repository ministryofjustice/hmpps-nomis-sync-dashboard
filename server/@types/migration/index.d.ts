import { components } from '../migrationImport'

export type MigrationHistory = components['schemas']['MigrationHistory']
export type InProgressMigration = components['schemas']['InProgressMigration']

export type VisitsMigrationFilter = components['schemas']['VisitsMigrationFilter']
export type MigrationContextVisitsMigrationFilter = components['schemas']['MigrationContextVisitsMigrationFilter']

export type SentencingMigrationFilter = components['schemas']['SentencingMigrationFilter']
export type MigrationContextSentencingMigrationFilter =
  components['schemas']['MigrationContextSentencingMigrationFilter']

export type AppointmentsMigrationFilter = components['schemas']['AppointmentsMigrationFilter']
export type ActivitiesMigrationFilter = components['schemas']['ActivitiesMigrationFilter']
export type AllocationsMigrationFilter = components['schemas']['AllocationsMigrationFilter']
export type AdjudicationsMigrationFilter = components['schemas']['AdjudicationsMigrationFilter']
export type MigrationContextAppointmentsMigrationFilter =
  components['schemas']['MigrationContextAppointmentsMigrationFilter']
export type MigrationContextActivitiesMigrationFilter =
  components['schemas']['MigrationContextActivitiesMigrationFilter']
export type MigrationContextAllocationsMigrationFilter =
  components['schemas']['MigrationContextAllocationsMigrationFilter']
export type MigrationContextAdjudicationsMigrationFilter =
  components['schemas']['MigrationContextAdjudicationsMigrationFilter']

export type PageActivitiesIdResponse = components['schemas']['PageFindActiveActivityIdsResponse']
export type PageAllocationsIdResponse = components['schemas']['PageFindActiveAllocationIdsResponse']
export type FindSuspendedAllocationsResponse = components['schemas']['FindSuspendedAllocationsResponse']

export type GetDlqResult = components['schemas']['GetDlqResult']
export type PurgeQueueResult = components['schemas']['PurgeQueueResult']
export type RoomMappingsResponse = components['schemas']['VisitRoomUsageResponse']
