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
import ActivitiesNomisMigrationService from './activities/activitiesNomisMigrationService'
import AllocationsNomisMigrationService from './allocations/allocationsNomisMigrationService'
import AppointmentsNomisMigrationService from './appointments/appointmentsNomisMigrationService'
import CourtSentencingNomisMigrationService from './courtSentencing/courtSentencingNomisMigrationService'
import IncidentsNomisMigrationService from './incidents/incidentsNomisMigrationService'
import SentencingNomisMigrationService from './sentencing/sentencingNomisMigrationService'
import VisitsNomisMigrationService from './visits/visitsNomisMigrationService'

export const services = () => {
  const {
    hmppsAuthClient,
    applicationInfo,
    activitiesNomisMigrationClient,
    allocationsNomisMigrationClient,
    appointmentsNomisMigrationClient,
  } = dataAccess()

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
    activitiesNomisMigrationService: new ActivitiesNomisMigrationService(activitiesNomisMigrationClient),
    allocationsNomisMigrationService: new AllocationsNomisMigrationService(allocationsNomisMigrationClient),
    appointmentsNomisMigrationService: new AppointmentsNomisMigrationService(appointmentsNomisMigrationClient),
    contactPersonNomisMigrationService: new ContactPersonNomisMigrationService(),
    contactPersonNomisPrisonerService: new ContactPersonNomisPrisonerService(hmppsAuthClient),
    contactPersonProfileDetailsNomisMigrationService: new ContactPersonProfileDetailsNomisMigrationService(),
    contactPersonProfileDetailsNomisPrisonerService: new ContactPersonProfileDetailsNomisPrisonerService(
      hmppsAuthClient,
    ),
    corePersonNomisMigrationService: new CorePersonNomisMigrationService(),
    corporateNomisMigrationService: new CorporateNomisMigrationService(),
    corporateNomisPrisonerService: new CorporateNomisPrisonerService(hmppsAuthClient),
    courtSentencingNomisMigrationService: new CourtSentencingNomisMigrationService(),
    incidentsNomisMigrationService: new IncidentsNomisMigrationService(),
    sentencingNomisMigrationService: new SentencingNomisMigrationService(),
    visitBalanceNomisMigrationService: new VisitBalanceNomisMigrationService(),
    visitBalanceNomisPrisonerService: new VisitBalanceNomisPrisonerService(hmppsAuthClient),
    visitsNomisMigrationService: new VisitsNomisMigrationService(),
  }
}

export type Services = ReturnType<typeof services>
