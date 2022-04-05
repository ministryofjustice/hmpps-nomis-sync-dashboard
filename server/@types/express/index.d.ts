export default {}

declare module 'express-session' {
  interface StartVisitsMigrationForm {
    dlqCount?: string
    unmappedRooms?: string[]
    prisonIds?: string
    visitTypes?: string | string[]
    fromDateTime?: string
    toDateTime?: string
    action?: 'startMigration'
    estimatedCount?: string
    migrationId?: string
  }

  // Declare that the session will potentially contain these additional fields
  interface SessionData {
    returnTo: string
    nowInMinutes: number
    startVisitsMigrationForm: StartVisitsMigrationForm
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
    }
  }
}
