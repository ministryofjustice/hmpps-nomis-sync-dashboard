import type { RequestHandler, Router } from 'express'

import asyncMiddleware from '../../middleware/asyncMiddleware'
import CorporateNomisMigrationService from '../../services/corporate/corporateNomisMigrationService'
import CorporateNomisPrisonerService from '../../services/corporate/corporateNomisPrisonerService'
import CorporateMigrationController from './corporateMigrationController'
import NomisMigrationService from '../../services/nomisMigrationService'

export interface Services {
  corporateNomisMigrationService: CorporateNomisMigrationService
  corporateNomisPrisonerService: CorporateNomisPrisonerService
  nomisMigrationService: NomisMigrationService
}
export default function routes(router: Router, services: Services): Router {
  const get = (path: string, handler: RequestHandler) => router.get(path, asyncMiddleware(handler))
  const post = (path: string, handler: RequestHandler) => router.post(path, asyncMiddleware(handler))

  const migrationController = new CorporateMigrationController(
    services.corporateNomisMigrationService,
    services.corporateNomisPrisonerService,
    services.nomisMigrationService,
  )
  get('/corporate-migration', (req, res) => migrationController.getMigrations(req, res))
  get('/corporate-migration/failures', (req, res) => migrationController.viewFailures(req, res))
  get('/corporate-migration/start', (req, res) => migrationController.startNewMigration(req, res))
  post('/corporate-migration/start', (req, res) => migrationController.postStartMigration(req, res))
  get('/corporate-migration/amend', (req, res) => migrationController.startMigration(req, res))
  get('/corporate-migration/start/preview', (req, res) => migrationController.startMigrationPreview(req, res))
  post('/corporate-migration/start/preview', (req, res) => migrationController.postStartMigrationPreview(req, res))
  post('/corporate-migration/start/delete-failures', (req, res) =>
    migrationController.postClearDLQMigrationPreview(req, res),
  )
  get('/corporate-migration/start/confirmation', (req, res) => migrationController.startMigrationConfirmation(req, res))
  get('/corporate-migration/details', (req, res) => migrationController.migrationDetails(req, res))
  post('/corporate-migration/cancel', (req, res) => migrationController.cancelMigration(req, res))

  return router
}
