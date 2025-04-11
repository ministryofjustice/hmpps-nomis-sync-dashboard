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
import config from '../config'
import ActivitiesNomisMigrationClient from './activitiesNomisMigrationClient'
import AllocationsNomisMigrationClient from './allocationsNomisMigrationClient'
import AppointmentsNomisMigrationClient from './appointmentsNomisMigrationClient'
import ContactPersonNomisMigrationClient from './contactPersonNomisMigrationClient'
import ContactPersonNomisPrisonerClient from './contactPersonNomisPrisonerClient'
import ContactPersonProfileDetailsNomisMigrationClient from './contactPersonProfileDetailsNomisMigrationClient'
import logger from '../../logger'
import ContactPersonProfileDetailsNomisPrisonerClient from './contactPersonProfileDetailsNomisPrisonerClient'
import CorePersonNomisMigrationClient from './corePersonNomisMigrationClient'

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
  }
}

export type DataAccess = ReturnType<typeof dataAccess>

export { HmppsAuthClient, RestClientBuilder }
