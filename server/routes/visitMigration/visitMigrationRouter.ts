import type { RequestHandler, Router } from 'express'

import asyncMiddleware from '../../middleware/asyncMiddleware'
import VisitMigrationController from './visitMigrationController'
import NomisMigrationService from '../../services/nomisMigrationService'
import NomisPrisonerService from '../../services/nomisPrisonerService'

export interface Services {
  nomisMigrationService: NomisMigrationService
  nomisPrisonerService: NomisPrisonerService
}
export default function routes(router: Router, services: Services): Router {
  const get = (path: string, handler: RequestHandler) => router.get(path, asyncMiddleware(handler))
  const post = (path: string, handler: RequestHandler) => router.post(path, asyncMiddleware(handler))

  const visitMigrationController = new VisitMigrationController(
    services.nomisMigrationService,
    services.nomisPrisonerService
  )
  get('/visits-migration', (req, res) => visitMigrationController.getVisitMigrations(req, res))
  get('/visits-migration/start', (req, res) => visitMigrationController.startVisitMigration(req, res))
  post('/visits-migration/start', (req, res) => visitMigrationController.postStartVisitMigration(req, res))
  get('/visits-migration/start/confirmation', (req, res) =>
    visitMigrationController.startVisitMigrationConfirmation(req, res)
  )
  get('/visits-migration/failures', (req, res) => visitMigrationController.viewFailures(req, res))

  return router
}
