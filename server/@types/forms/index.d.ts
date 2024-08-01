declare module 'forms' {
  export interface StartVisitsMigrationForm {
    prisonIds?: string
    visitTypes?: string | string[]
    fromDateTime?: string
    toDateTime?: string
    action?: 'startMigration' | 'viewEstimatedCount'
  }

  export interface StartSentencingMigrationForm {
    fromDate?: string
    toDate?: string
    action?: 'startMigration' | 'viewEstimatedCount'
  }

  export interface StartIncidentsMigrationForm {
    fromDate?: string
    toDate?: string
    action?: 'startMigration' | 'viewEstimatedCount'
  }

  export interface StartCSIPMigrationForm {
    fromDate?: string
    toDate?: string
    action?: 'startMigration' | 'viewEstimatedCount'
  }

  export interface StartAppointmentsMigrationForm {
    prisonIds?: string
    fromDate?: string
    toDate?: string
    action?: 'startMigration' | 'viewEstimatedCount'
  }

  export interface StartActivitiesMigrationForm {
    prisonId?: string
    courseActivityId?: number
    action?: 'startMigration' | 'viewEstimatedCount'
  }

  export interface StartAllocationsMigrationForm {
    prisonId?: string
    courseActivityId?: number
    action?: 'startMigration' | 'viewEstimatedCount'
  }

  export interface StartAlertsMigrationForm {
    fromDate?: string
    toDate?: string
    action?: 'startMigration' | 'viewEstimatedCount'
  }

  export interface StartPrisonPersonigrationForm {
    prisonerNumber?: string
    action?: 'startMigration' | 'viewEstimatedCount'
  }
}
