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

  const incentivesMigrationController = new IncentivesMigrationController(services.nomisMigrationService)
  get('/incentives-migration', (req, res) => incentivesMigrationController.getIncentiveMigrations(req, res))
  get('/incentives-migration/failures', (req, res) => incentivesMigrationController.viewFailures(req, res))

  return router
}
