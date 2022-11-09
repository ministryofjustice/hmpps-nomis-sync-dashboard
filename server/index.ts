import createApp from './app'
import HmppsAuthClient from './data/hmppsAuthClient'
import { createRedisClient } from './data/redisClient'
import TokenStore from './data/tokenStore'
import UserService from './services/userService'
import NomisMigrationService from './services/nomisMigrationService'
import NomisPrisonerService from './services/nomisPrisonerService'
import MappingService from './services/mappingService'

const hmppsAuthClient = new HmppsAuthClient(new TokenStore(createRedisClient()))
const userService = new UserService(hmppsAuthClient)
const visitMigrationService = new NomisMigrationService(hmppsAuthClient)
const nomisPrisonerService = new NomisPrisonerService(hmppsAuthClient)
const mappingService = new MappingService(hmppsAuthClient)

const app = createApp(userService, visitMigrationService, nomisPrisonerService, mappingService)

export default app
