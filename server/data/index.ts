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
import CorporateNomisMigrationClient from './corporateNomisMigrationClient'
import CorporateNomisPrisonerClient from './corporateNomisPrisonerClient'
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
    activitiesNomisMigrationClient: new ActivitiesNomisMigrationClient(),
    allocationsNomisMigrationClient: new AllocationsNomisMigrationClient(),
    appointmentsNomisMigrationClient: new AppointmentsNomisMigrationClient(),
    contactPersonNomisMigrationClient: new ContactPersonNomisMigrationClient(),
    contactPersonNomisPrisonerClient: new ContactPersonNomisPrisonerClient(hmppsAuthClient),
    contactPersonProfileDetailsNomisMigrationClient: new ContactPersonProfileDetailsNomisMigrationClient(),
    contactPersonProfileDetailsNomisPrisonerClient: new ContactPersonProfileDetailsNomisPrisonerClient(hmppsAuthClient),
    corePersonNomisMigrationClient: new CorePersonNomisMigrationClient(),
    corporateNomisMigrationClient: new CorporateNomisMigrationClient(),
    corporateNomisPrisonerClient: new CorporateNomisPrisonerClient(hmppsAuthClient),
    courtSentencingNomisMigrationClient: new CourtSentencingNomisMigrationClient(),
    incidentsNomisMigrationClient: new IncidentsNomisMigrationClient(),
    nomisMigrationClient: new NomisMigrationClient(hmppsAuthClient),
    nomisPrisonerClient: new NomisPrisonerClient(hmppsAuthClient),
    mappingClient: new MappingClient(hmppsAuthClient),
    sentencingNomisMigrationClient: new SentencingNomisMigrationClient(),
    visitBalanceNomisMigrationClient: new VisitBalanceNomisMigrationClient(),
    visitBalanceNomisPrisonerClient: new VisitBalanceNomisPrisonerClient(hmppsAuthClient),
    visitsNomisMigrationClient: new VisitsNomisMigrationClient(),
    movementsNomisMigrationClient: new MovementsNomisMigrationClient(),
    movementsNomisPrisonerClient: new MovementsNomisPrisonerClient(hmppsAuthClient),
  }
}

export { AuthenticationClient }
