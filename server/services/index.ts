import { dataAccess } from '../data'

import NomisMigrationService from './nomisMigrationService'
import NomisPrisonerService from './nomisPrisonerService'
import MappingService from './mappingService'
import ActivitiesService from './activitiesService'
import CorePersonNomisMigrationService from './coreperson/corePersonNomisMigrationService'
import VisitslotsNomisMigrationService from './visitslots/visitslotsNomisMigrationService'
import VisitslotsNomisPrisonerService from './visitslots/visitslotsNomisPrisonerService'
import PrisonBalanceNomisMigrationService from './finance/prisonBalanceNomisMigrationService'
import PrisonBalanceNomisPrisonerService from './finance/prisonBalanceNomisPrisonerService'
import PrisonerBalanceNomisMigrationService from './finance/prisonerBalanceNomisMigrationService'
import PrisonerBalanceNomisPrisonerService from './finance/prisonerBalanceNomisPrisonerService'
import ActivitiesNomisMigrationService from './activities/activitiesNomisMigrationService'
import AllocationsNomisMigrationService from './allocations/allocationsNomisMigrationService'
import AppointmentsNomisMigrationService from './appointments/appointmentsNomisMigrationService'
import CourtSentencingNomisMigrationService from './courtSentencing/courtSentencingNomisMigrationService'
import IncidentsNomisMigrationService from './incidents/incidentsNomisMigrationService'
import VisitsNomisMigrationService from './visits/visitsNomisMigrationService'
import MovementsNomisMigrationService from './movements/movementsNomisMigrationService'
import MovementsNomisPrisonerService from './movements/movementsNomisPrisonerService'
import OfficialvisitsNomisMigrationService from './officialvisits/officialvisitsNomisMigrationService'
import OfficialvisitsNomisPrisonerService from './officialvisits/officialvisitsNomisPrisonerService'

export const services = () => {
  const {
    applicationInfo,
    activitiesClient,
    activitiesNomisMigrationClient,
    allocationsNomisMigrationClient,
    appointmentsNomisMigrationClient,
    corePersonNomisMigrationClient,
    visitslotsNomisMigrationClient,
    visitslotsNomisPrisonerClient,
    courtSentencingNomisMigrationClient,
    mappingClient,
    nomisMigrationClient,
    nomisPrisonerClient,
    incidentsNomisMigrationClient,
    prisonBalanceNomisMigrationClient,
    prisonBalanceNomisPrisonerClient,
    prisonerBalanceNomisMigrationClient,
    prisonerBalanceNomisPrisonerClient,
    visitsNomisMigrationClient,
    movementsNomisMigrationClient,
    movementsNomisPrisonerClient,
    officialvisitsNomisMigrationClient,
    officialvisitsNomisPrisonerClient,
  } = dataAccess()

  return {
    applicationInfo,
    nomisMigrationService: new NomisMigrationService(nomisMigrationClient),
    nomisPrisonerService: new NomisPrisonerService(nomisPrisonerClient),
    mappingService: new MappingService(mappingClient),
    activitiesService: new ActivitiesService(activitiesClient),
    activitiesNomisMigrationService: new ActivitiesNomisMigrationService(activitiesNomisMigrationClient),
    allocationsNomisMigrationService: new AllocationsNomisMigrationService(allocationsNomisMigrationClient),
    appointmentsNomisMigrationService: new AppointmentsNomisMigrationService(appointmentsNomisMigrationClient),
    corePersonNomisMigrationService: new CorePersonNomisMigrationService(corePersonNomisMigrationClient),
    visitslotsNomisMigrationService: new VisitslotsNomisMigrationService(visitslotsNomisMigrationClient),
    visitslotsNomisPrisonerService: new VisitslotsNomisPrisonerService(visitslotsNomisPrisonerClient),
    courtSentencingNomisMigrationService: new CourtSentencingNomisMigrationService(courtSentencingNomisMigrationClient),
    incidentsNomisMigrationService: new IncidentsNomisMigrationService(incidentsNomisMigrationClient),
    prisonBalanceNomisMigrationService: new PrisonBalanceNomisMigrationService(prisonBalanceNomisMigrationClient),
    prisonBalanceNomisPrisonerService: new PrisonBalanceNomisPrisonerService(prisonBalanceNomisPrisonerClient),
    prisonerBalanceNomisMigrationService: new PrisonerBalanceNomisMigrationService(prisonerBalanceNomisMigrationClient),
    prisonerBalanceNomisPrisonerService: new PrisonerBalanceNomisPrisonerService(prisonerBalanceNomisPrisonerClient),
    visitsNomisMigrationService: new VisitsNomisMigrationService(visitsNomisMigrationClient),
    movementsNomisMigrationService: new MovementsNomisMigrationService(movementsNomisMigrationClient),
    movementsNomisPrisonerService: new MovementsNomisPrisonerService(movementsNomisPrisonerClient),
    officialvisitsNomisMigrationService: new OfficialvisitsNomisMigrationService(officialvisitsNomisMigrationClient),
    officialvisitsNomisPrisonerService: new OfficialvisitsNomisPrisonerService(officialvisitsNomisPrisonerClient),
  }
}

export type Services = ReturnType<typeof services>
