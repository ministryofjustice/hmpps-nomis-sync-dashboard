import type { Response } from 'express'
import jwtDecode from 'jwt-decode'

const MIGRATE_VISITS_ROLE = 'ROLE_MIGRATE_VISITS'
const MIGRATE_INCENTIVES_ROLE = 'ROLE_MIGRATE_INCENTIVES'
const TEMP_ROOM_MAPPING_ROLE = 'ROLE_TEST_ROLE'

const extractRoles = (res: Response): Array<string> => {
  const token = res?.locals?.user?.token
  const decodedToken = token && (jwtDecode(res.locals.user.token) as { authorities?: string[] })
  return (decodedToken && decodedToken.authorities) || []
}

export { MIGRATE_VISITS_ROLE, MIGRATE_INCENTIVES_ROLE, TEMP_ROOM_MAPPING_ROLE, extractRoles }
