import type { Response } from 'express'
import { jwtDecode } from 'jwt-decode'

const MIGRATE_VISITS_ROLE = 'ROLE_MIGRATE_VISITS'
const MIGRATE_SENTENCING_ROLE = 'ROLE_MIGRATE_SENTENCING'
const MIGRATE_ACTIVITIES_ROLE = 'ROLE_MIGRATE_ACTIVITIES'
const MIGRATE_ALLOCATIONS_ROLE = 'ROLE_MIGRATE_ACTIVITIES' // This role is deliberately shared with Activities as they are closely related
const MIGRATE_APPOINTMENTS_ROLE = 'ROLE_MIGRATE_APPOINTMENTS'
const MIGRATE_CORE_PERSON_ROLE = 'ROLE_MIGRATE_CORE_PERSON'
const MIGRATE_CSIP_ROLE = 'ROLE_MIGRATE_CSIP'
const MIGRATE_INCIDENT_REPORTS_ROLE = 'ROLE_MIGRATE_INCIDENT_REPORTS'
const MIGRATE_CONTACTPERSON_ROLE = 'ROLE_MIGRATE_CONTACTPERSON'
const MIGRATE_NOMIS_SYSCON = 'ROLE_MIGRATE_NOMIS_SYSCON'

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
  MIGRATE_CORE_PERSON_ROLE,
  MIGRATE_CSIP_ROLE,
  MIGRATE_INCIDENT_REPORTS_ROLE,
  MIGRATE_CONTACTPERSON_ROLE,
  MIGRATE_NOMIS_SYSCON,
  extractRoles,
}
