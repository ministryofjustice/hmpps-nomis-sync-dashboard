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
import VisitBalanceNomisMigrationService from './visitbalance/visitBalanceNomisMigrationService'
import VisitBalanceNomisPrisonerService from './visitbalance/visitBalanceNomisPrisonerService'
import ContactPersonProfileDetailsNomisMigrationService from './contactperson/profiledetails/contactPersonProfileDetailsNomisMigrationService'
import ContactPersonProfileDetailsNomisPrisonerService from './contactperson/profiledetails/contactPersonProfileDetailsNomisPrisonerService'

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
    contactPersonProfileDetailsNomisMigrationService: new ContactPersonProfileDetailsNomisMigrationService(
      hmppsAuthClient,
    ),
    contactPersonProfileDetailsNomisPrisonerService: new ContactPersonProfileDetailsNomisPrisonerService(
      hmppsAuthClient,
    ),
    corePersonNomisMigrationService: new CorePersonNomisMigrationService(hmppsAuthClient),
    corporateNomisMigrationService: new CorporateNomisMigrationService(hmppsAuthClient),
    corporateNomisPrisonerService: new CorporateNomisPrisonerService(hmppsAuthClient),
    visitBalanceNomisMigrationService: new VisitBalanceNomisMigrationService(hmppsAuthClient),
    visitBalanceNomisPrisonerService: new VisitBalanceNomisPrisonerService(hmppsAuthClient),
  }
}

export type Services = ReturnType<typeof services>
