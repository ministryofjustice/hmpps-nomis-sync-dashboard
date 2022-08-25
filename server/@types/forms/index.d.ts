declare module 'forms' {
  export interface StartVisitsMigrationForm {
    prisonIds?: string
    visitTypes?: string | string[]
    fromDateTime?: string
    toDateTime?: string
    action?: 'startMigration' | 'viewEstimatedCount'
  }
  export interface StartIncentivesMigrationForm {
    fromDate?: string
    toDate?: string
    action?: 'startMigration' | 'viewEstimatedCount'
  }
}
