import type { RequestHandler, Router } from 'express'

import asyncMiddleware from '../../middleware/asyncMiddleware'
import IncidentsMigrationController from './incidentsMigrationController'
import NomisMigrationService from '../../services/nomisMigrationService'
import NomisPrisonerService from '../../services/nomisPrisonerService'
import IncidentsNomisMigrationService from '../../services/incidents/incidentsNomisMigrationService'

export interface Services {
  incidentsNomisMigrationService: IncidentsNomisMigrationService
  nomisMigrationService: NomisMigrationService
  nomisPrisonerService: NomisPrisonerService
}
export default function routes(router: Router, services: Services): Router {
  const get = (path: string, handler: RequestHandler) => router.get(path, asyncMiddleware(handler))
  const post = (path: string, handler: RequestHandler) => router.post(path, asyncMiddleware(handler))

  const incidentsMigrationController = new IncidentsMigrationController(
    services.incidentsNomisMigrationService,
    services.nomisMigrationService,
    services.nomisPrisonerService,
  )
  get('/incidents-migration', (req, res) => incidentsMigrationController.getIncidentsMigrations(req, res))
  get('/incidents-migration/failures', (req, res) => incidentsMigrationController.viewFailures(req, res))
  get('/incidents-migration/start', (req, res) => incidentsMigrationController.startNewIncidentsMigration(req, res))
  post('/incidents-migration/start', (req, res) => incidentsMigrationController.postStartIncidentsMigration(req, res))
  get('/incidents-migration/amend', (req, res) => incidentsMigrationController.startIncidentsMigration(req, res))
  get('/incidents-migration/start/preview', (req, res) =>
    incidentsMigrationController.startIncidentsMigrationPreview(req, res),
  )
  post('/incidents-migration/start/preview', (req, res) =>
    incidentsMigrationController.postStartIncidentsMigrationPreview(req, res),
  )
  post('/incidents-migration/start/delete-faiures', (req, res) =>
    incidentsMigrationController.postClearDLQIncidentsMigrationPreview(req, res),
  )
  get('/incidents-migration/start/confirmation', (req, res) =>
    incidentsMigrationController.startIncidentsMigrationConfirmation(req, res),
  )
  get('/incidents-migration/details', (req, res) => incidentsMigrationController.incidentsMigrationDetails(req, res))
  post('/incidents-migration/cancel', (req, res) => incidentsMigrationController.cancelMigration(req, res))

  return router
}
