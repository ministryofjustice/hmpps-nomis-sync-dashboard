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
  const post = (path: string, handler: RequestHandler) => router.post(path, asyncMiddleware(handler))

  const prisonPersonMigrationController = new PrisonPersonMigrationController(
    services.nomisMigrationService,
    services.nomisPrisonerService,
  )
  get('/prisonperson-migration', (req, res) => prisonPersonMigrationController.getPrisonPersonMigrations(req, res))
  get('/prisonperson-migration/failures', (req, res) => prisonPersonMigrationController.viewFailures(req, res))
  get('/prisonperson-migration/start', (req, res) =>
    prisonPersonMigrationController.startNewPrisonPersonMigration(req, res),
  )
  post('/prisonperson-migration/start', (req, res) =>
    prisonPersonMigrationController.postStartPrisonPersonMigration(req, res),
  )
  get('/prisonperson-migration/amend', (req, res) =>
    prisonPersonMigrationController.startPrisonPersonMigration(req, res),
  )
  get('/prisonperson-migration/start/preview', (req, res) =>
    prisonPersonMigrationController.startPrisonPersonMigrationPreview(req, res),
  )
  post('/prisonperson-migration/start/preview', (req, res) =>
    prisonPersonMigrationController.postStartPrisonPersonMigrationPreview(req, res),
  )
  post('/prisonperson-migration/start/delete-failures', (req, res) =>
    prisonPersonMigrationController.postClearDLQPrisonPersonMigrationPreview(req, res),
  )
  get('/prisonperson-migration/start/confirmation', (req, res) =>
    prisonPersonMigrationController.startPrisonPersonMigrationConfirmation(req, res),
  )
  get('/prisonperson-migration/details', (req, res) =>
    prisonPersonMigrationController.prisonPersonMigrationDetails(req, res),
  )
  post('/prisonperson-migration/cancel', (req, res) => prisonPersonMigrationController.cancelMigration(req, res))

  return router
}
