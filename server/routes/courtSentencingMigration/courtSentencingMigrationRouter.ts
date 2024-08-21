import type { RequestHandler, Router } from 'express'

import asyncMiddleware from '../../middleware/asyncMiddleware'
import CourtSentencingMigrationController from './courtSentencingMigrationController'
import NomisMigrationService from '../../services/nomisMigrationService'
import NomisPrisonerService from '../../services/nomisPrisonerService'

export interface Services {
  nomisMigrationService: NomisMigrationService
  nomisPrisonerService: NomisPrisonerService
}
export default function routes(router: Router, services: Services): Router {
  const get = (path: string, handler: RequestHandler) => router.get(path, asyncMiddleware(handler))
  const post = (path: string, handler: RequestHandler) => router.post(path, asyncMiddleware(handler))

  const courtSentencingMigrationController = new CourtSentencingMigrationController(
    services.nomisMigrationService,
    services.nomisPrisonerService,
  )
  get('/court-sentencing-migration', (req, res) =>
    courtSentencingMigrationController.getCourtSentencingMigrations(req, res),
  )
  get('/court-sentencing-migration/failures', (req, res) => courtSentencingMigrationController.viewFailures(req, res))
  get('/court-sentencing-migration/start', (req, res) =>
    courtSentencingMigrationController.startNewCourtSentencingMigration(req, res),
  )
  post('/court-sentencing-migration/start', (req, res) =>
    courtSentencingMigrationController.postStartCourtSentencingMigration(req, res),
  )
  get('/court-sentencing-migration/amend', (req, res) =>
    courtSentencingMigrationController.startCourtSentencingMigration(req, res),
  )
  get('/court-sentencing-migration/start/preview', (req, res) =>
    courtSentencingMigrationController.startCourtSentencingMigrationPreview(req, res),
  )
  post('/court-sentencing-migration/start/preview', (req, res) =>
    courtSentencingMigrationController.postStartCourtSentencingMigrationPreview(req, res),
  )
  post('/court-sentencing-migration/start/delete-faiures', (req, res) =>
    courtSentencingMigrationController.postClearDLQCourtSentencingMigrationPreview(req, res),
  )
  get('/court-sentencing-migration/start/confirmation', (req, res) =>
    courtSentencingMigrationController.startCourtSentencingMigrationConfirmation(req, res),
  )
  get('/court-sentencing-migration/details', (req, res) =>
    courtSentencingMigrationController.courtSentencingMigrationDetails(req, res),
  )
  post('/court-sentencing-migration/cancel', (req, res) => courtSentencingMigrationController.cancelMigration(req, res))

  return router
}
