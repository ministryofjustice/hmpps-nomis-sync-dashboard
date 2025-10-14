import type { Response } from 'express'
import { jwtDecode } from 'jwt-decode'

// This role is deliberately shared with Allocations as they are closely related
const MIGRATE_ACTIVITIES_ROLE = 'ROLE_MIGRATE_ACTIVITIES'
const MIGRATE_APPOINTMENTS_ROLE = 'ROLE_MIGRATE_APPOINTMENTS'
const MIGRATE_NOMIS_SYSCON = 'ROLE_MIGRATE_NOMIS_SYSCON'
const MIGRATE_SENTENCING_ROLE = 'ROLE_MIGRATE_SENTENCING'
const MIGRATE_VISITS_ROLE = 'ROLE_MIGRATE_VISITS'

const extractRoles = (res: Response): Array<string> => {
  const token = res?.locals?.user?.token
  const decodedToken = token && (jwtDecode(res.locals.user.token) as { authorities?: string[] })
  return (decodedToken && decodedToken.authorities) || []
}

export {
  MIGRATE_VISITS_ROLE,
  MIGRATE_SENTENCING_ROLE,
  MIGRATE_ACTIVITIES_ROLE,
  MIGRATE_APPOINTMENTS_ROLE,
  MIGRATE_NOMIS_SYSCON,
  extractRoles,
}
