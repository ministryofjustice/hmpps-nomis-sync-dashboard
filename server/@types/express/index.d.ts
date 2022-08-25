export default {}

declare module 'express-session' {
  interface MigrationForm {
    dlqCount?: string
    action?: 'startMigration'
    estimatedCount?: string
    migrationId?: string
  }
  interface StartVisitsMigrationForm extends MigrationForm {
    unmappedRooms?: string[]
    prisonIds?: string
    visitTypes?: string | string[]
    fromDateTime?: string
    toDateTime?: string
  }

  interface StartIncentivesMigrationForm extends MigrationForm {
    fromDate?: string
    toDate?: string
  }

  // Declare that the session will potentially contain these additional fields
  interface SessionData {
    returnTo: string
    nowInMinutes: number
    startVisitsMigrationForm: StartVisitsMigrationForm
    startIncentivesMigrationForm: StartIncentivesMigrationForm
  }
}

export declare global {
  namespace Express {
    interface User {
      username: string
      token: string
      authSource: string
    }

    interface ValidationError {
      href: string
      text: string
    }

    interface Request {
      verified?: boolean
      id: string
      flash(type: string, message: ValidationError[]): number
      flash(message: 'errors'): Array<Record<string, string>>
      logout(done: (err: unknown) => void): void
    }
  }
}
