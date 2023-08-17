import type { RequestHandler, Router } from 'express'

import asyncMiddleware from '../../middleware/asyncMiddleware'
import AdjudicationsMigrationController from './adjudicationsMigrationController'
import NomisMigrationService from '../../services/nomisMigrationService'
import NomisPrisonerService from '../../services/nomisPrisonerService'

export interface Services {
  nomisMigrationService: NomisMigrationService
  nomisPrisonerService: NomisPrisonerService
}
export default function routes(router: Router, services: Services): Router {
  const get = (path: string, handler: RequestHandler) => router.get(path, asyncMiddleware(handler))
  const post = (path: string, handler: RequestHandler) => router.post(path, asyncMiddleware(handler))

  const adjudicationsMigrationController = new AdjudicationsMigrationController(
    services.nomisMigrationService,
    services.nomisPrisonerService,
  )
  get('/adjudications-migration', (req, res) => adjudicationsMigrationController.getAdjudicationsMigrations(req, res))
  get('/adjudications-migration/failures', (req, res) => adjudicationsMigrationController.viewFailures(req, res))
  get('/adjudications-migration/start', (req, res) =>
    adjudicationsMigrationController.startNewAdjudicationsMigration(req, res),
  )
  post('/adjudications-migration/start', (req, res) =>
    adjudicationsMigrationController.postStartAdjudicationsMigration(req, res),
  )
  get('/adjudications-migration/amend', (req, res) =>
    adjudicationsMigrationController.startAdjudicationsMigration(req, res),
  )
  get('/adjudications-migration/start/preview', (req, res) =>
    adjudicationsMigrationController.startAdjudicationsMigrationPreview(req, res),
  )
  post('/adjudications-migration/start/preview', (req, res) =>
    adjudicationsMigrationController.postStartAdjudicationsMigrationPreview(req, res),
  )
  post('/adjudications-migration/start/delete-faiures', (req, res) =>
    adjudicationsMigrationController.postClearDLQAdjudicationsMigrationPreview(req, res),
  )
  get('/adjudications-migration/start/confirmation', (req, res) =>
    adjudicationsMigrationController.startAdjudicationsMigrationConfirmation(req, res),
  )
  get('/adjudications-migration/details', (req, res) =>
    adjudicationsMigrationController.adjudicationsMigrationDetails(req, res),
  )
  post('/adjudications-migration/cancel', (req, res) => adjudicationsMigrationController.cancelMigration(req, res))

  return router
}
