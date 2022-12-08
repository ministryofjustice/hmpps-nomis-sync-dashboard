import { dataAccess } from '../data'

import UserService from './userService'
import NomisMigrationService from './nomisMigrationService'
import NomisPrisonerService from './nomisPrisonerService'
import MappingService from './mappingService'

export const services = () => {
  const { hmppsAuthClient } = dataAccess()

  const userService = new UserService(hmppsAuthClient)
  const nomisMigrationService = new NomisMigrationService(hmppsAuthClient)
  const nomisPrisonerService = new NomisPrisonerService(hmppsAuthClient)
  const mappingService = new MappingService(hmppsAuthClient)

  return {
    userService,
    nomisMigrationService,
    nomisPrisonerService,
    mappingService,
  }
}

export type Services = ReturnType<typeof services>

export { UserService }
