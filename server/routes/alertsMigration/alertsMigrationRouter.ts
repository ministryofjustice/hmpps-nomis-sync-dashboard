import type { RequestHandler, Router } from 'express'

import asyncMiddleware from '../../middleware/asyncMiddleware'
import AlertsMigrationController from './alertsMigrationController'
import NomisMigrationService from '../../services/nomisMigrationService'
import NomisPrisonerService from '../../services/nomisPrisonerService'

export interface Services {
  nomisMigrationService: NomisMigrationService
  nomisPrisonerService: NomisPrisonerService
}
export default function routes(router: Router, services: Services): Router {
  const get = (path: string, handler: RequestHandler) => router.get(path, asyncMiddleware(handler))
  const post = (path: string, handler: RequestHandler) => router.post(path, asyncMiddleware(handler))

  const alertsMigrationController = new AlertsMigrationController(
    services.nomisMigrationService,
    services.nomisPrisonerService,
  )
  get('/alerts-migration', (req, res) => alertsMigrationController.getAlertsMigrations(req, res))
  get('/alerts-migration/failures', (req, res) => alertsMigrationController.viewFailures(req, res))
  get('/alerts-migration/start', (req, res) => alertsMigrationController.startNewAlertsMigration(req, res))
  post('/alerts-migration/start', (req, res) => alertsMigrationController.postStartAlertsMigration(req, res))
  get('/alerts-migration/amend', (req, res) => alertsMigrationController.startAlertsMigration(req, res))
  get('/alerts-migration/start/preview', (req, res) => alertsMigrationController.startAlertsMigrationPreview(req, res))
  post('/alerts-migration/start/preview', (req, res) =>
    alertsMigrationController.postStartAlertsMigrationPreview(req, res),
  )
  post('/alerts-migration/start/delete-faiures', (req, res) =>
    alertsMigrationController.postClearDLQAlertsMigrationPreview(req, res),
  )
  get('/alerts-migration/start/confirmation', (req, res) =>
    alertsMigrationController.startAlertsMigrationConfirmation(req, res),
  )
  get('/alerts-migration/details', (req, res) => alertsMigrationController.alertsMigrationDetails(req, res))
  post('/alerts-migration/cancel', (req, res) => alertsMigrationController.cancelMigration(req, res))

  return router
}
