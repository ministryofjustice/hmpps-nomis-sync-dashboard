export type MigrationViewFilter = {
  toDateTime?: string
  fromDateTime?: string
  includeOnlyFailures?: boolean
}

export type VisitsMigrationViewFilter = MigrationViewFilter & {
  prisonId?: string
}

export type AppointmentsMigrationViewFilter = MigrationViewFilter & {
  prisonId?: string
}
