import { dataAccess } from '../data'

import NomisMigrationService from './nomisMigrationService'
import NomisPrisonerService from './nomisPrisonerService'
import MappingService from './mappingService'
import ActivitiesService from './activitiesService'
import ContactPersonNomisMigrationService from './contactperson/contactPersonNomisMigrationService'
import ContactPersonNomisPrisonerService from './contactperson/contactPersonNomisPrisonerService'

export const services = () => {
  const { hmppsAuthClient, applicationInfo } = dataAccess()

  const nomisMigrationService = new NomisMigrationService(hmppsAuthClient)
  const nomisPrisonerService = new NomisPrisonerService(hmppsAuthClient)
  const mappingService = new MappingService(hmppsAuthClient)
  const activitiesService = new ActivitiesService(hmppsAuthClient)

  return {
    applicationInfo,
    nomisMigrationService,
    nomisPrisonerService,
    mappingService,
    activitiesService,
    contactPersonNomisMigrationService: new ContactPersonNomisMigrationService(hmppsAuthClient),
    contactPersonNomisPrisonerService: new ContactPersonNomisPrisonerService(hmppsAuthClient),
  }
}

export type Services = ReturnType<typeof services>
