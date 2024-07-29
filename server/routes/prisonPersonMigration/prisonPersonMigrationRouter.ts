import type { RequestHandler, Router } from 'express'

import asyncMiddleware from '../../middleware/asyncMiddleware'
import NomisMigrationService from '../../services/nomisMigrationService'
import NomisPrisonerService from '../../services/nomisPrisonerService'
import PrisonPersonMigrationController from './prisonPersonMigrationController'

export interface Services {
  nomisMigrationService: NomisMigrationService
  nomisPrisonerService: NomisPrisonerService
}
export default function routes(router: Router, services: Services): Router {
  const get = (path: string, handler: RequestHandler) => router.get(path, asyncMiddleware(handler))

  const prisonPersonMigrationController = new PrisonPersonMigrationController(services.nomisMigrationService)
  get('/prisonperson-migration', (req, res) => prisonPersonMigrationController.getPrisonPersonMigrations(req, res))
  get('/prisonperson-migration/failures', (req, res) => prisonPersonMigrationController.viewFailures(req, res))
  get('/prisonperson-migration/details', (req, res) =>
    prisonPersonMigrationController.prisonPersonMigrationDetails(req, res),
  )

  return router
}
