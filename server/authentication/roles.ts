import type { Response } from 'express'
import { jwtDecode } from 'jwt-decode'

const MIGRATE_VISITS_ROLE = 'ROLE_MIGRATE_VISITS'
const MIGRATE_SENTENCING_ROLE = 'ROLE_MIGRATE_SENTENCING'
const MIGRATE_ACTIVITIES_ROLE = 'ROLE_MIGRATE_ACTIVITIES'
const MIGRATE_ALLOCATIONS_ROLE = 'ROLE_MIGRATE_ACTIVITIES' // This role is deliberately shared with Activities as they are closely related
const MIGRATE_APPOINTMENTS_ROLE = 'ROLE_MIGRATE_APPOINTMENTS'
const MIGRATE_ALERTS_ROLE = 'ROLE_MIGRATE_ALERTS'
const MIGRATE_INCIDENT_REPORTS_ROLE = 'ROLE_MIGRATE_INCIDENT_REPORTS'
const MIGRATE_CSIP_ROLE = 'ROLE_MIGRATE_CSIP'

const extractRoles = (res: Response): Array<string> => {
  const token = res?.locals?.user?.token
  const decodedToken = token && (jwtDecode(res.locals.user.token) as { authorities?: string[] })
  return (decodedToken && decodedToken.authorities) || []
}

export {
  MIGRATE_VISITS_ROLE,
  MIGRATE_SENTENCING_ROLE,
  MIGRATE_ACTIVITIES_ROLE,
  MIGRATE_ALLOCATIONS_ROLE,
  MIGRATE_APPOINTMENTS_ROLE,
  MIGRATE_ALERTS_ROLE,
  MIGRATE_INCIDENT_REPORTS_ROLE,
  MIGRATE_CSIP_ROLE,
  extractRoles,
}
