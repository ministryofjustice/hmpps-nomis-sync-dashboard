import type { RequestHandler, Router } from 'express'

import asyncMiddleware from '../../middleware/asyncMiddleware'
import VisitMigrationController from './visitMigrationController'
import NomisMigrationService from '../../services/nomisMigrationService'

export interface Services {
  nomisMigrationService: NomisMigrationService
}
export default function routes(router: Router, services: Services): Router {
  const get = (path: string, handler: RequestHandler) => router.get(path, asyncMiddleware(handler))

  const visitMigrationController = new VisitMigrationController(services.nomisMigrationService)
  get('/visits-migration', (req, res) => visitMigrationController.getVisitMigrations(req, res))
  get('/visits-migration/start', (req, res) => visitMigrationController.startVisitMigration(req, res))

  return router
}
