import { dataAccess } from '../data'

import NomisMigrationService from './nomisMigrationService'
import NomisPrisonerService from './nomisPrisonerService'
import MappingService from './mappingService'
import ActivitiesService from './activitiesService'
import ContactPersonNomisMigrationService from './contactperson/contactPersonNomisMigrationService'
import ContactPersonNomisPrisonerService from './contactperson/contactPersonNomisPrisonerService'
import CorePersonNomisMigrationService from './coreperson/corePersonNomisMigrationService'
import CorporateNomisMigrationService from './corporate/corporateNomisMigrationService'
import CorporateNomisPrisonerService from './corporate/corporateNomisPrisonerService'

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
    corePersonNomisMigrationService: new CorePersonNomisMigrationService(hmppsAuthClient),
    corporateNomisMigrationService: new CorporateNomisMigrationService(hmppsAuthClient),
    corporateNomisPrisonerService: new CorporateNomisPrisonerService(hmppsAuthClient),
  }
}

export type Services = ReturnType<typeof services>
