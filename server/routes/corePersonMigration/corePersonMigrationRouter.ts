import type { RequestHandler, Router } from 'express'

import asyncMiddleware from '../../middleware/asyncMiddleware'
import CorePersonNomisMigrationService from '../../services/coreperson/corePersonNomisMigrationService'
import NomisPrisonerService from '../../services/nomisPrisonerService'
import CorePersonMigrationController from './corePersonMigrationController'
import NomisMigrationService from '../../services/nomisMigrationService'

export interface Services {
  corePersonNomisMigrationService: CorePersonNomisMigrationService
  nomisPrisonerService: NomisPrisonerService
  nomisMigrationService: NomisMigrationService
}
export default function routes(router: Router, services: Services): Router {
  const get = (path: string, handler: RequestHandler) => router.get(path, asyncMiddleware(handler))
  const post = (path: string, handler: RequestHandler) => router.post(path, asyncMiddleware(handler))

  const migrationController = new CorePersonMigrationController(
    services.corePersonNomisMigrationService,
    services.nomisPrisonerService,
    services.nomisMigrationService,
  )
  get('/coreperson-migration', (req, res) => migrationController.getMigrations(req, res))
  get('/coreperson-migration/failures', (req, res) => migrationController.viewFailures(req, res))
  get('/coreperson-migration/start', (req, res) => migrationController.startNewMigration(req, res))
  post('/coreperson-migration/start', (req, res) => migrationController.postStartMigration(req, res))
  get('/coreperson-migration/amend', (req, res) => migrationController.startMigration(req, res))
  get('/coreperson-migration/start/preview', (req, res) => migrationController.startMigrationPreview(req, res))
  post('/coreperson-migration/start/preview', (req, res) => migrationController.postStartMigrationPreview(req, res))
  post('/coreperson-migration/start/delete-faiures', (req, res) =>
    migrationController.postClearDLQMigrationPreview(req, res),
  )
  get('/coreperson-migration/start/confirmation', (req, res) =>
    migrationController.startMigrationConfirmation(req, res),
  )
  get('/coreperson-migration/details', (req, res) => migrationController.migrationDetails(req, res))
  post('/coreperson-migration/cancel', (req, res) => migrationController.cancelMigration(req, res))

  return router
}
