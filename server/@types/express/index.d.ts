import { HmppsUser } from '../../interfaces/hmppsUser'

export default {}

declare module 'express-session' {
  interface MigrationForm {
    dlqCount?: string
    action?: 'startMigration'
    estimatedCount?: string
    migrationId?: string
  }
  interface StartVisitsMigrationForm extends MigrationForm {
    unmappedRooms?: UnmappedRooms[]
    prisonIds?: string
    visitTypes?: string | string[]
    fromDateTime?: string
    toDateTime?: string
  }

  interface UnmappedRooms {
    room: string
    count: number
  }

  interface EndMigratedActivitiesResult {
    migrationId: string
    result: string
  }

  interface StartSentencingMigrationForm extends MigrationForm {
    fromDate?: string
    toDate?: string
  }

  interface StartAppointmentsMigrationForm extends MigrationForm {
    fromDate?: string
    toDate?: string
    prisonIds?: string
    prisonsNotSwitchedOnNomis: string[]
    appointmentCounts: string[]
  }

  interface StartActivitiesMigrationForm extends MigrationForm {
    prisonId?: string
    courseActivityId?: number
    incentiveLevelIds?: string[]
    prisonSwitchedOnNomis: boolean | string
    prisonSwitchedOnDps: boolean | null
    dpsPayBandsExist: boolean | null
    dpsPrisonRegimeExists: boolean | null
    suspendedAllocations: string[]
    allocationsMissingPayBands: string[]
    payRatesUnknownIncentive: string[]
  }

  interface StartAllocationsMigrationForm extends MigrationForm {
    prisonId?: string
    courseActivityId?: number
  }

  interface StartCourtSentencingMigrationForm extends MigrationForm {
    fromDate?: string
    toDate?: string
    prisonIds?: string
  }

  interface StartIncidentsMigrationForm extends MigrationForm {
    fromDate?: string
    toDate?: string
  }

  interface StartCSIPMigrationForm extends MigrationForm {
    fromDate?: string
    toDate?: string
  }

  interface StartPrisonPersonMigrationForm extends MigrationForm {
    prisonerNumber?: string
  }

  // Declare that the session will potentially contain these additional fields
  interface SessionData {
    returnTo: string
    nowInMinutes: number
    startVisitsMigrationForm: StartVisitsMigrationForm
    startSentencingMigrationForm: StartSentencingMigrationForm
    startActivitiesMigrationForm: StartActivitiesMigrationForm
    startAllocationsMigrationForm: StartAllocationsMigrationForm
    startAppointmentsMigrationForm: StartAppointmentsMigrationForm
    startCourtSentencingMigrationForm: StartCourtSentencingMigrationForm
    startIncidentsMigrationForm: StartIncidentsMigrationForm
    startCSIPMigrationForm: StartCSIPMigrationForm
    endMigratedActivitiesResult: EndMigratedActivitiesResult
    startPrisonPersonMigrationForm: StartPrisonPersonMigrationForm
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

    interface Locals {
      user: HmppsUser
    }
  }
}
