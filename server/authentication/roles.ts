import type { Response } from 'express'
import jwtDecode from 'jwt-decode'

const MIGRATE_VISITS_ROLE = 'ROLE_MIGRATE_VISITS'
const MIGRATE_SENTENCING_ROLE = 'ROLE_MIGRATE_SENTENCING'
const MIGRATE_APPOINTMENTS_ROLE = 'ROLE_MIGRATE_APPOINTMENTS'
const MIGRATE_ADJUDICATIONS_ROLE = 'ROLE_MIGRATE_ADJUDICATIONS'

const extractRoles = (res: Response): Array<string> => {
  const token = res?.locals?.user?.token
  const decodedToken = token && (jwtDecode(res.locals.user.token) as { authorities?: string[] })
  return (decodedToken && decodedToken.authorities) || []
}

export {
  MIGRATE_VISITS_ROLE,
  MIGRATE_SENTENCING_ROLE,
  MIGRATE_APPOINTMENTS_ROLE,
  MIGRATE_ADJUDICATIONS_ROLE,
  extractRoles,
}
