import type { RequestHandler, Router } from 'express'

import asyncMiddleware from '../../../middleware/asyncMiddleware'
import NomisMigrationService from '../../../services/contactperson/profiledetails/contactPersonProfileDetailsNomisMigrationService'
import NomisPrisonerService from '../../../services/contactperson/profiledetails/contactPersonProfileDetailsNomisPrisonerService'
import MigrationController from './contactPersonProfileDetailsMigrationController'

export interface Services {
  contactPersonProfileDetailsNomisMigrationService: NomisMigrationService
  contactPersonProfileDetailsNomisPrisonerService: NomisPrisonerService
}
export default function routes(router: Router, services: Services): Router {
  const get = (path: string, handler: RequestHandler) => router.get(path, asyncMiddleware(handler))
  const post = (path: string, handler: RequestHandler) => router.post(path, asyncMiddleware(handler))

  const migrationController = new MigrationController(
    services.contactPersonProfileDetailsNomisMigrationService,
    services.contactPersonProfileDetailsNomisPrisonerService,
  )
  get('/contactperson-profiledetails-migration', (req, res) => migrationController.getMigrations(req, res))
  get('/contactperson-profiledetails-migration/start', (req, res) => migrationController.startNewMigration(req, res))
  post('/contactperson-profiledetails-migration/start', (req, res) => migrationController.postStartMigration(req, res))
  get('/contactperson-profiledetails-migration/amend', (req, res) => migrationController.startMigration(req, res))
  get('/contactperson-profiledetails-migration/start/preview', (req, res) =>
    migrationController.startMigrationPreview(req, res),
  )
  post('/contactperson-profiledetails-migration/start/preview', (req, res) =>
    migrationController.postStartMigrationPreview(req, res),
  )
  post('/contactperson-profiledetails-migration/start/delete-failures', (req, res) =>
    migrationController.postClearDLQMigrationPreview(req, res),
  )
  get('/contactperson-profiledetails-migration/start/confirmation', (req, res) =>
    migrationController.startMigrationConfirmation(req, res),
  )
  get('/contactperson-profiledetails-migration/details', (req, res) => migrationController.migrationDetails(req, res))
  post('/contactperson-profiledetails-migration/cancel', (req, res) => migrationController.cancelMigration(req, res))

  return router
}
