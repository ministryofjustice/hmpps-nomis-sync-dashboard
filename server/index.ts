import createApp from './app'
import HmppsAuthClient from './data/hmppsAuthClient'
import { createRedisClient } from './data/redisClient'
import TokenStore from './data/tokenStore'
import UserService from './services/userService'
import NomisMigrationService from './services/nomisMigrationService'

const hmppsAuthClient = new HmppsAuthClient(new TokenStore(createRedisClient()))
const userService = new UserService(hmppsAuthClient)
const visitMigrationService = new NomisMigrationService(hmppsAuthClient)

const app = createApp(userService, visitMigrationService)

export default app
