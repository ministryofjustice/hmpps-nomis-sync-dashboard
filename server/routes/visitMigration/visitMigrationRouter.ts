import type { RequestHandler, Router } from 'express'

import asyncMiddleware from '../../middleware/asyncMiddleware'
import VisitMigrationController from './visitMigrationController'
import VisitMigrationService from '../../services/visitMigrationService'

export interface Services {
  visitMigrationService: VisitMigrationService
}
export default function routes(router: Router, services: Services): Router {
  const get = (path: string, handler: RequestHandler) => router.get(path, asyncMiddleware(handler))

  const visitMigrationController = new VisitMigrationController(services.visitMigrationService)
  get('/visits-migration', (req, res) => visitMigrationController.getVisitMigrations(req, res))
  return router
}
