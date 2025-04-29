/* eslint-disable import/first */
/*
 * Do appinsights first as it does some magic instrumentation work, i.e. it affects other 'require's
 * In particular, applicationinsights automatically collects bunyan logs
 */
import { AuthenticationClient } from '@ministryofjustice/hmpps-auth-clients'
import { initialiseAppInsights, buildAppInsightsClient } from '../utils/azureAppInsights'
import applicationInfoSupplier from '../applicationInfo'

const applicationInfo = applicationInfoSupplier()
initialiseAppInsights()
buildAppInsightsClient(applicationInfo)

import HmppsAuthClient from './hmppsAuthClient'
import { createRedisClient } from './redisClient'
import RedisTokenStore from './tokenStore/redisTokenStore'
import InMemoryTokenStore from './tokenStore/inMemoryTokenStore'
import logger from '../../logger'
import config from '../config'
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

type RestClientBuilder<T> = (token: string) => T

export const dataAccess = () => {
  const authenticationClient = new AuthenticationClient(
    config.apis.hmppsAuth,
    logger,
    config.redis.enabled ? new RedisTokenStore(createRedisClient()) : new InMemoryTokenStore(),
  )
  return {
    applicationInfo,
    hmppsAuthClient: new HmppsAuthClient(
      config.redis.enabled ? new RedisTokenStore(createRedisClient()) : new InMemoryTokenStore(),
    ),
    activitiesNomisMigrationClient: new ActivitiesNomisMigrationClient(),
    allocationsNomisMigrationClient: new AllocationsNomisMigrationClient(),
    appointmentsNomisMigrationClient: new AppointmentsNomisMigrationClient(),
    contactPersonNomisMigrationClient: new ContactPersonNomisMigrationClient(),
    contactPersonNomisPrisonerClient: new ContactPersonNomisPrisonerClient(authenticationClient),
    contactPersonProfileDetailsNomisMigrationClient: new ContactPersonProfileDetailsNomisMigrationClient(),
    contactPersonProfileDetailsNomisPrisonerClient: new ContactPersonProfileDetailsNomisPrisonerClient(
      authenticationClient,
    ),
    corePersonNomisMigrationClient: new CorePersonNomisMigrationClient(),
    corporateNomisMigrationClient: new CorporateNomisMigrationClient(),
    corporateNomisPrisonerClient: new CorporateNomisPrisonerClient(authenticationClient),
    courtSentencingNomisMigrationClient: new CourtSentencingNomisMigrationClient(),
    incidentsNomisMigrationClient: new IncidentsNomisMigrationClient(),
    sentencingNomisMigrationClient: new SentencingNomisMigrationClient(),
    visitBalanceNomisMigrationClient: new VisitBalanceNomisMigrationClient(),
    visitBalanceNomisPrisonerClient: new VisitBalanceNomisPrisonerClient(authenticationClient),
    visitsNomisMigrationClient: new VisitsNomisMigrationClient(),
  }
}

export type DataAccess = ReturnType<typeof dataAccess>

export { HmppsAuthClient, RestClientBuilder }
