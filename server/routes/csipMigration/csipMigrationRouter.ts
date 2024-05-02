import type { RequestHandler, Router } from 'express'

import asyncMiddleware from '../../middleware/asyncMiddleware'
import CSIPMigrationController from './csipMigrationController'
import NomisMigrationService from '../../services/nomisMigrationService'
import NomisPrisonerService from '../../services/nomisPrisonerService'

export interface Services {
  nomisMigrationService: NomisMigrationService
  nomisPrisonerService: NomisPrisonerService
}
export default function routes(router: Router, services: Services): Router {
  const get = (path: string, handler: RequestHandler) => router.get(path, asyncMiddleware(handler))
  const post = (path: string, handler: RequestHandler) => router.post(path, asyncMiddleware(handler))

  const csipMigrationController = new CSIPMigrationController(
    services.nomisMigrationService,
    services.nomisPrisonerService,
  )
  get('/csip-migration', (req, res) => csipMigrationController.getCSIPMigrations(req, res))
  get('/csip-migration/failures', (req, res) => csipMigrationController.viewFailures(req, res))
  get('/csip-migration/start', (req, res) => csipMigrationController.startNewCSIPMigration(req, res))
  post('/csip-migration/start', (req, res) => csipMigrationController.postStartCSIPMigration(req, res))
  get('/csip-migration/amend', (req, res) => csipMigrationController.startCSIPMigration(req, res))
  get('/csip-migration/start/preview', (req, res) => csipMigrationController.startCSIPMigrationPreview(req, res))
  post('/csip-migration/start/preview', (req, res) => csipMigrationController.postStartCSIPMigrationPreview(req, res))
  post('/csip-migration/start/delete-faiures', (req, res) =>
    csipMigrationController.postClearDLQCSIPMigrationPreview(req, res),
  )
  get('/csip-migration/start/confirmation', (req, res) =>
    csipMigrationController.startCSIPMigrationConfirmation(req, res),
  )
  get('/csip-migration/details', (req, res) => csipMigrationController.csipMigrationDetails(req, res))
  post('/csip-migration/cancel', (req, res) => csipMigrationController.cancelMigration(req, res))

  return router
}
