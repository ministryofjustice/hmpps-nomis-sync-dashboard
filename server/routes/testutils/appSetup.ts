import express, { Express } from 'express'
import { NotFound } from 'http-errors'

import routes from '../index'
import nunjucksSetup from '../../utils/nunjucksSetup'
import errorHandler from '../../errorHandler'
import * as auth from '../../authentication/auth'
import type { Services } from '../../services'
import type { ApplicationInfo } from '../../applicationInfo'
import { HmppsUser } from '../../interfaces/hmppsUser'

const testAppInfo: ApplicationInfo = {
  applicationName: 'test',
  buildNumber: '1',
  gitRef: 'long ref',
  gitShortHash: 'short ref',
  branchName: 'main',
}

export const user: HmppsUser = {
  name: 'john smith',
  userId: 'id',
  token: '',
  username: 'user1',
  displayName: 'John Smith',
  authSource: 'nomis',
  userRoles: [],
}

export const flashProvider = jest.fn()

function appSetup(services: Services, production: boolean, userSupplier: () => HmppsUser): Express {
  const app = express()

  app.set('view engine', 'njk')

  nunjucksSetup(app, testAppInfo)
  app.use((req, res, next) => {
    req.user = userSupplier() as Express.User
    req.flash = flashProvider
    res.locals = {
      user: { ...req.user } as HmppsUser,
    }
    next()
  })
  app.use(express.json())
  app.use(express.urlencoded({ extended: true }))
  app.use(routes(services))
  app.use((req, res, next) => next(new NotFound()))
  app.use(errorHandler(production))

  return app
}

export function appWithAllRoutes({
  production = false,
  services = {},
  userSupplier = () => user,
}: {
  production?: boolean
  services?: Partial<Services>
  userSupplier?: () => HmppsUser
}): Express {
  auth.default.authenticationMiddleware = () => (req, res, next) => next()
  return appSetup(services as Services, production, userSupplier)
}
