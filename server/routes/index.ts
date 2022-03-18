import type { RequestHandler, Router } from 'express'
import VisitMigrationController from './visitMigration/visitMigrationController'
import visitMigrationRoutes, {Services} from './visitMigration/visitMigrationRouter'

import asyncMiddleware from '../middleware/asyncMiddleware'

export default function routes(router: Router, services: Services): Router {
  const get = (path: string, handler: RequestHandler) => router.get(path, asyncMiddleware(handler))

  get('/', (req, res, next) => {
    res.render('pages/index')
  })

  visitMigrationRoutes(router, services)
  return router
}
