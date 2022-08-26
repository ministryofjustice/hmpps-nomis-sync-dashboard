import type { RequestHandler, Router } from 'express'

import asyncMiddleware from '../../middleware/asyncMiddleware'
import IncentivesMigrationController from './incentivesMigrationController'
import NomisMigrationService from '../../services/nomisMigrationService'
import NomisPrisonerService from '../../services/nomisPrisonerService'

export interface Services {
  nomisMigrationService: NomisMigrationService
  nomisPrisonerService: NomisPrisonerService
}
export default function routes(router: Router, services: Services): Router {
  const get = (path: string, handler: RequestHandler) => router.get(path, asyncMiddleware(handler))
  const post = (path: string, handler: RequestHandler) => router.post(path, asyncMiddleware(handler))

  const incentivesMigrationController = new IncentivesMigrationController(
    services.nomisMigrationService,
    services.nomisPrisonerService
  )
  get('/incentives-migration', (req, res) => incentivesMigrationController.getIncentiveMigrations(req, res))
  get('/incentives-migration/failures', (req, res) => incentivesMigrationController.viewFailures(req, res))
  get('/incentives-migration/start', (req, res) => incentivesMigrationController.startNewIncentiveMigration(req, res))
  post('/incentives-migration/start', (req, res) => incentivesMigrationController.postStartIncentiveMigration(req, res))
  get('/incentives-migration/amend', (req, res) => incentivesMigrationController.startIncentiveMigration(req, res))
  get('/incentives-migration/start/preview', (req, res) =>
    incentivesMigrationController.startIncentiveMigrationPreview(req, res)
  )
  post('/incentives-migration/start/preview', (req, res) =>
    incentivesMigrationController.postStartIncentiveMigrationPreview(req, res)
  )
  post('/incentives-migration/start/delete-faiures', (req, res) =>
    incentivesMigrationController.postClearDLQIncentiveMigrationPreview(req, res)
  )
  get('/incentives-migration/start/confirmation', (req, res) =>
    incentivesMigrationController.startIncentiveMigrationConfirmation(req, res)
  )
  get('/incentives-migration/details', (req, res) => incentivesMigrationController.incentivesMigrationDetails(req, res))
  post('/incentives-migration/cancel', (req, res) => incentivesMigrationController.cancelMigration(req, res))

  return router
}
