import { AuthenticationClient, InMemoryTokenStore, RedisTokenStore } from '@ministryofjustice/hmpps-auth-clients'
import { createRedisClient } from './redisClient'
import config from '../config'
import logger from '../../logger'
import ActivitiesNomisMigrationClient from './activitiesNomisMigrationClient'
import AdvancesNomisMigrationClient from './advancesNomisMigrationClient'
import AllocationsNomisMigrationClient from './allocationsNomisMigrationClient'
import AppointmentsNomisMigrationClient from './appointmentsNomisMigrationClient'
import CorePersonNomisMigrationClient from './corePersonNomisMigrationClient'
import VisitslotsNomisMigrationClient from './visitslotsNomisMigrationClient'
import VisitslotsNomisPrisonerClient from './visitslotsNomisPrisonerClient'
import CourtSentencingNomisMigrationClient from './courtSentencingNomisMigrationClient'
import VisitsNomisMigrationClient from './visitsNomisMigrationClient'
import NomisPrisonerClient from './nomisPrisonerClient'
import MappingClient from './mappingClient'
import ActivitiesClient from './activitiesClient'
import AdvancesNomisPrisonerClient from './advancesNomisPrisonerClient'
import NomisMigrationClient from './nomisMigrationClient'
import MovementsNomisPrisonerClient from './movementsNomisPrisonerClient'
import CourtSchedulerNomisMigrationClient from './courtSchedulerNomisMigrationClient'
import PrisonBalanceNomisMigrationClient from './prisonBalanceNomisMigrationClient'
import PrisonBalanceNomisPrisonerClient from './prisonBalanceNomisPrisonerClient'
import PrisonerBalanceNomisMigrationClient from './prisonerBalanceNomisMigrationClient'
import PrisonerBalanceNomisPrisonerClient from './prisonerBalanceNomisPrisonerClient'
import OfficialvisitsNomisMigrationClient from './officialvisitsNomisMigrationClient'
import OfficialvisitsNomisPrisonerClient from './officialvisitsNomisPrisonerClient'
import StaffNomisMigrationClient from './staffNomisMigrationClient'
import StaffNomisPrisonerClient from './staffNomisPrisonerClient'
import applicationInfoSupplier from '../applicationInfo'

const applicationInfo = applicationInfoSupplier()

export const dataAccess = () => {
  const hmppsAuthClient = new AuthenticationClient(
    config.apis.hmppsAuth,
    logger,
    config.redis.enabled ? new RedisTokenStore(createRedisClient()) : new InMemoryTokenStore(),
  )

  return {
    applicationInfo,
    hmppsAuthClient,
    activitiesClient: new ActivitiesClient(hmppsAuthClient),
    activitiesNomisMigrationClient: new ActivitiesNomisMigrationClient(hmppsAuthClient),
    allocationsNomisMigrationClient: new AllocationsNomisMigrationClient(hmppsAuthClient),
    appointmentsNomisMigrationClient: new AppointmentsNomisMigrationClient(hmppsAuthClient),
    corePersonNomisMigrationClient: new CorePersonNomisMigrationClient(hmppsAuthClient),
    visitslotsNomisMigrationClient: new VisitslotsNomisMigrationClient(hmppsAuthClient),
    visitslotsNomisPrisonerClient: new VisitslotsNomisPrisonerClient(hmppsAuthClient),
    courtSentencingNomisMigrationClient: new CourtSentencingNomisMigrationClient(hmppsAuthClient),
    nomisMigrationClient: new NomisMigrationClient(hmppsAuthClient),
    nomisPrisonerClient: new NomisPrisonerClient(hmppsAuthClient),
    mappingClient: new MappingClient(hmppsAuthClient),
    prisonBalanceNomisMigrationClient: new PrisonBalanceNomisMigrationClient(hmppsAuthClient),
    prisonBalanceNomisPrisonerClient: new PrisonBalanceNomisPrisonerClient(hmppsAuthClient),
    prisonerBalanceNomisMigrationClient: new PrisonerBalanceNomisMigrationClient(hmppsAuthClient),
    prisonerBalanceNomisPrisonerClient: new PrisonerBalanceNomisPrisonerClient(hmppsAuthClient),
    visitsNomisMigrationClient: new VisitsNomisMigrationClient(hmppsAuthClient),
    courtSchedulerNomisMigrationClient: new CourtSchedulerNomisMigrationClient(hmppsAuthClient),
    movementsNomisPrisonerClient: new MovementsNomisPrisonerClient(hmppsAuthClient),
    officialvisitsNomisMigrationClient: new OfficialvisitsNomisMigrationClient(hmppsAuthClient),
    officialvisitsNomisPrisonerClient: new OfficialvisitsNomisPrisonerClient(hmppsAuthClient),
    staffNomisMigrationClient: new StaffNomisMigrationClient(hmppsAuthClient),
    staffNomisPrisonerClient: new StaffNomisPrisonerClient(hmppsAuthClient),
    advancesNomisMigrationClient: new AdvancesNomisMigrationClient(hmppsAuthClient),
    advancesNomisPrisonerClient: new AdvancesNomisPrisonerClient(hmppsAuthClient),
  }
}

export { AuthenticationClient }
