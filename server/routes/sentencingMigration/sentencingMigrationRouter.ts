import type { RequestHandler, Router } from 'express'

import asyncMiddleware from '../../middleware/asyncMiddleware'
import SentencingMigrationController from './sentencingMigrationController'
import NomisMigrationService from '../../services/nomisMigrationService'
import NomisPrisonerService from '../../services/nomisPrisonerService'

export interface Services {
  nomisMigrationService: NomisMigrationService
  nomisPrisonerService: NomisPrisonerService
}
export default function routes(router: Router, services: Services): Router {
  const get = (path: string, handler: RequestHandler) => router.get(path, asyncMiddleware(handler))
  const post = (path: string, handler: RequestHandler) => router.post(path, asyncMiddleware(handler))

  const sentencingMigrationController = new SentencingMigrationController(
    services.nomisMigrationService,
    services.nomisPrisonerService,
  )
  get('/sentencing-migration', (req, res) => sentencingMigrationController.getSentencingMigrations(req, res))
  get('/sentencing-migration/failures', (req, res) => sentencingMigrationController.viewFailures(req, res))
  get('/sentencing-migration/start', (req, res) => sentencingMigrationController.startNewSentencingMigration(req, res))
  post('/sentencing-migration/start', (req, res) =>
    sentencingMigrationController.postStartSentencingMigration(req, res),
  )
  get('/sentencing-migration/amend', (req, res) => sentencingMigrationController.startSentencingMigration(req, res))
  get('/sentencing-migration/start/preview', (req, res) =>
    sentencingMigrationController.startSentencingMigrationPreview(req, res),
  )
  post('/sentencing-migration/start/preview', (req, res) =>
    sentencingMigrationController.postStartSentencingMigrationPreview(req, res),
  )
  post('/sentencing-migration/start/delete-faiures', (req, res) =>
    sentencingMigrationController.postClearDLQSentencingMigrationPreview(req, res),
  )
  get('/sentencing-migration/start/confirmation', (req, res) =>
    sentencingMigrationController.startSentencingMigrationConfirmation(req, res),
  )
  get('/sentencing-migration/details', (req, res) => sentencingMigrationController.sentencingMigrationDetails(req, res))
  post('/sentencing-migration/cancel', (req, res) => sentencingMigrationController.cancelMigration(req, res))

  return router
}
