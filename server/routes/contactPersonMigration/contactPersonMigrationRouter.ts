import type { RequestHandler, Router } from 'express'

import asyncMiddleware from '../../middleware/asyncMiddleware'
import ContactPersonNomisMigrationService from '../../services/contactperson/contactPersonNomisMigrationService'
import ContactPersonNomisPrisonerService from '../../services/contactperson/contactPersonNomisPrisonerService'
import ContactPersonMigrationController from './contactPersonMigrationController'
import NomisMigrationService from '../../services/nomisMigrationService'

export interface Services {
  contactPersonNomisMigrationService: ContactPersonNomisMigrationService
  contactPersonNomisPrisonerService: ContactPersonNomisPrisonerService
  nomisMigrationService: NomisMigrationService
}
export default function routes(router: Router, services: Services): Router {
  const get = (path: string, handler: RequestHandler) => router.get(path, asyncMiddleware(handler))
  const post = (path: string, handler: RequestHandler) => router.post(path, asyncMiddleware(handler))

  const migrationController = new ContactPersonMigrationController(
    services.contactPersonNomisMigrationService,
    services.contactPersonNomisPrisonerService,
    services.nomisMigrationService,
  )
  get('/contactperson-migration', (req, res) => migrationController.getMigrations(req, res))
  get('/contactperson-migration/failures', (req, res) => migrationController.viewFailures(req, res))
  get('/contactperson-migration/start', (req, res) => migrationController.startNewMigration(req, res))
  post('/contactperson-migration/start', (req, res) => migrationController.postStartMigration(req, res))
  get('/contactperson-migration/amend', (req, res) => migrationController.startMigration(req, res))
  get('/contactperson-migration/start/preview', (req, res) => migrationController.startMigrationPreview(req, res))
  post('/contactperson-migration/start/preview', (req, res) => migrationController.postStartMigrationPreview(req, res))
  post('/contactperson-migration/start/delete-failures', (req, res) =>
    migrationController.postClearDLQMigrationPreview(req, res),
  )
  get('/contactperson-migration/start/confirmation', (req, res) =>
    migrationController.startMigrationConfirmation(req, res),
  )
  get('/contactperson-migration/details', (req, res) => migrationController.migrationDetails(req, res))
  post('/contactperson-migration/cancel', (req, res) => migrationController.cancelMigration(req, res))

  return router
}
