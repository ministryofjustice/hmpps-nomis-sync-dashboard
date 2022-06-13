import type { RequestHandler, Router } from 'express'

import asyncMiddleware from '../../middleware/asyncMiddleware'
import VisitsMigrationController from './visitsMigrationController'
import NomisMigrationService from '../../services/nomisMigrationService'
import NomisPrisonerService from '../../services/nomisPrisonerService'

export interface Services {
  nomisMigrationService: NomisMigrationService
  nomisPrisonerService: NomisPrisonerService
}
export default function routes(router: Router, services: Services): Router {
  const get = (path: string, handler: RequestHandler) => router.get(path, asyncMiddleware(handler))
  const post = (path: string, handler: RequestHandler) => router.post(path, asyncMiddleware(handler))

  const visitMigrationController = new VisitsMigrationController(
    services.nomisMigrationService,
    services.nomisPrisonerService
  )
  get('/visits-migration', (req, res) => visitMigrationController.getVisitMigrations(req, res))
  get('/visits-migration/start', (req, res) => visitMigrationController.startNewVisitMigration(req, res))
  get('/visits-migration/amend', (req, res) => visitMigrationController.startVisitMigration(req, res))
  post('/visits-migration/start', (req, res) => visitMigrationController.postStartVisitMigration(req, res))
  get('/visits-migration/start/preview', (req, res) => visitMigrationController.startVisitMigrationPreview(req, res))
  post('/visits-migration/start/preview', (req, res) =>
    visitMigrationController.postStartVisitMigrationPreview(req, res)
  )
  get('/visits-migration/start/confirmation', (req, res) =>
    visitMigrationController.startVisitMigrationConfirmation(req, res)
  )
  get('/visits-migration/failures', (req, res) => visitMigrationController.viewFailures(req, res))
  get('/visits-migration/details', (req, res) => visitMigrationController.visitsMigrationDetails(req, res))
  post('/visits-migration/cancel', (req, res) => visitMigrationController.cancelMigration(req, res))

  return router
}
