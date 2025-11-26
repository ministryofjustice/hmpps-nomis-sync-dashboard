/* eslint-disable import/first */
/*
 * Do appinsights first as it does some magic instrumentation work, i.e. it affects other 'require's
 * In particular, applicationinsights automatically collects bunyan logs
 */
import { AuthenticationClient, InMemoryTokenStore, RedisTokenStore } from '@ministryofjustice/hmpps-auth-clients'
import { initialiseAppInsights, buildAppInsightsClient } from '../utils/azureAppInsights'
import applicationInfoSupplier from '../applicationInfo'

const applicationInfo = applicationInfoSupplier()
initialiseAppInsights()
buildAppInsightsClient(applicationInfo)

import { createRedisClient } from './redisClient'
import config from '../config'
import logger from '../../logger'
import ActivitiesNomisMigrationClient from './activitiesNomisMigrationClient'
import AllocationsNomisMigrationClient from './allocationsNomisMigrationClient'
import AppointmentsNomisMigrationClient from './appointmentsNomisMigrationClient'
import ContactPersonNomisMigrationClient from './contactPersonNomisMigrationClient'
import ContactPersonNomisPrisonerClient from './contactPersonNomisPrisonerClient'
import ContactPersonProfileDetailsNomisMigrationClient from './contactPersonProfileDetailsNomisMigrationClient'
import ContactPersonProfileDetailsNomisPrisonerClient from './contactPersonProfileDetailsNomisPrisonerClient'
import CorePersonNomisMigrationClient from './corePersonNomisMigrationClient'
import VisitslotsNomisMigrationClient from './visitslotsNomisMigrationClient'
import VisitslotsNomisPrisonerClient from './visitslotsNomisPrisonerClient'
import CourtSentencingNomisMigrationClient from './courtSentencingNomisMigrationClient'
import IncidentsNomisMigrationClient from './incidentsNomisMigrationClient'
import SentencingNomisMigrationClient from './sentencingNomisMigrationClient'
import VisitBalanceNomisMigrationClient from './visitBalanceNomisMigrationClient'
import VisitBalanceNomisPrisonerClient from './visitBalanceNomisPrisonerClient'
import VisitsNomisMigrationClient from './visitsNomisMigrationClient'
import NomisPrisonerClient from './nomisPrisonerClient'
import MappingClient from './mappingClient'
import ActivitiesClient from './activitiesClient'
import NomisMigrationClient from './nomisMigrationClient'
import MovementsNomisPrisonerClient from './movementsNomisPrisonerClient'
import MovementsNomisMigrationClient from './movementsNomisMigrationClient'
import PrisonBalanceNomisMigrationClient from './prisonBalanceNomisMigrationClient'
import PrisonBalanceNomisPrisonerClient from './prisonBalanceNomisPrisonerClient'
import PrisonerBalanceNomisMigrationClient from './prisonerBalanceNomisMigrationClient'
import PrisonerBalanceNomisPrisonerClient from './prisonerBalanceNomisPrisonerClient'
import OfficialvisitsNomisMigrationClient from './officialvisitsNomisMigrationClient'
import OfficialvisitsNomisPrisonerClient from './officialvisitsNomisPrisonerClient'

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
    contactPersonNomisMigrationClient: new ContactPersonNomisMigrationClient(hmppsAuthClient),
    contactPersonNomisPrisonerClient: new ContactPersonNomisPrisonerClient(hmppsAuthClient),
    contactPersonProfileDetailsNomisMigrationClient: new ContactPersonProfileDetailsNomisMigrationClient(
      hmppsAuthClient,
    ),
    contactPersonProfileDetailsNomisPrisonerClient: new ContactPersonProfileDetailsNomisPrisonerClient(hmppsAuthClient),
    corePersonNomisMigrationClient: new CorePersonNomisMigrationClient(hmppsAuthClient),
    visitslotsNomisMigrationClient: new VisitslotsNomisMigrationClient(hmppsAuthClient),
    visitslotsNomisPrisonerClient: new VisitslotsNomisPrisonerClient(hmppsAuthClient),
    courtSentencingNomisMigrationClient: new CourtSentencingNomisMigrationClient(hmppsAuthClient),
    incidentsNomisMigrationClient: new IncidentsNomisMigrationClient(hmppsAuthClient),
    nomisMigrationClient: new NomisMigrationClient(hmppsAuthClient),
    nomisPrisonerClient: new NomisPrisonerClient(hmppsAuthClient),
    mappingClient: new MappingClient(hmppsAuthClient),
    sentencingNomisMigrationClient: new SentencingNomisMigrationClient(hmppsAuthClient),
    prisonBalanceNomisMigrationClient: new PrisonBalanceNomisMigrationClient(hmppsAuthClient),
    prisonBalanceNomisPrisonerClient: new PrisonBalanceNomisPrisonerClient(hmppsAuthClient),
    prisonerBalanceNomisMigrationClient: new PrisonerBalanceNomisMigrationClient(hmppsAuthClient),
    prisonerBalanceNomisPrisonerClient: new PrisonerBalanceNomisPrisonerClient(hmppsAuthClient),
    visitBalanceNomisMigrationClient: new VisitBalanceNomisMigrationClient(hmppsAuthClient),
    visitBalanceNomisPrisonerClient: new VisitBalanceNomisPrisonerClient(hmppsAuthClient),
    visitsNomisMigrationClient: new VisitsNomisMigrationClient(hmppsAuthClient),
    movementsNomisMigrationClient: new MovementsNomisMigrationClient(hmppsAuthClient),
    movementsNomisPrisonerClient: new MovementsNomisPrisonerClient(hmppsAuthClient),
    officialvisitsNomisMigrationClient: new OfficialvisitsNomisMigrationClient(hmppsAuthClient),
    officialvisitsNomisPrisonerClient: new OfficialvisitsNomisPrisonerClient(hmppsAuthClient),
  }
}

export { AuthenticationClient }
