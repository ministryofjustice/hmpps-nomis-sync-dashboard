import type { RequestHandler, Router } from 'express'

import asyncMiddleware from '../../middleware/asyncMiddleware'
import ActivitiesMigrationController from './activitiesMigrationController'
import NomisMigrationService from '../../services/nomisMigrationService'
import NomisPrisonerService from '../../services/nomisPrisonerService'

export interface Services {
  nomisMigrationService: NomisMigrationService
  nomisPrisonerService: NomisPrisonerService
}
export default function routes(router: Router, services: Services): Router {
  const get = (path: string, handler: RequestHandler) => router.get(path, asyncMiddleware(handler))
  const post = (path: string, handler: RequestHandler) => router.post(path, asyncMiddleware(handler))

  const activitiesMigrationController = new ActivitiesMigrationController(services.nomisMigrationService)
  get('/activities-migration', (req, res) => activitiesMigrationController.getActivitiesMigrations(req, res))
  get('/activities-migration/failures', (req, res) => activitiesMigrationController.viewFailures(req, res))
  get('/activities-migration/start', (req, res) => activitiesMigrationController.startNewActivitiesMigration(req, res))
  post('/activities-migration/start', (req, res) =>
    activitiesMigrationController.postStartActivitiesMigration(req, res),
  )
  get('/activities-migration/amend', (req, res) => activitiesMigrationController.startActivitiesMigration(req, res))
  get('/activities-migration/start/preview', (req, res) =>
    activitiesMigrationController.startActivitiesMigrationPreview(req, res),
  )
  post('/activities-migration/start/preview', (req, res) =>
    activitiesMigrationController.postStartActivitiesMigrationPreview(req, res),
  )
  post('/activities-migration/start/delete-faiures', (req, res) =>
    activitiesMigrationController.postClearDLQActivitiesMigrationPreview(req, res),
  )
  get('/activities-migration/start/confirmation', (req, res) =>
    activitiesMigrationController.startActivitiesMigrationConfirmation(req, res),
  )
  get('/activities-migration/details', (req, res) => activitiesMigrationController.activitiesMigrationDetails(req, res))
  post('/activities-migration/cancel', (req, res) => activitiesMigrationController.cancelMigration(req, res))

  return router
}
