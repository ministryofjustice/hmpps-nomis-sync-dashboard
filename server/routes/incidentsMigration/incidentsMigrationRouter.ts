import express, { RequestHandler, Router } from 'express'

import asyncMiddleware from '../../middleware/asyncMiddleware'
import IncidentsMigrationController from './incidentsMigrationController'
import NomisMigrationService from '../../services/nomisMigrationService'
import NomisPrisonerService from '../../services/nomisPrisonerService'
import IncidentsNomisMigrationService from '../../services/incidents/incidentsNomisMigrationService'
import authorisationMiddleware from '../../middleware/authorisationMiddleware'
import { MIGRATE_INCIDENT_REPORTS_ROLE, MIGRATE_NOMIS_SYSCON } from '../../authentication/roles'

export default function routes({
  incidentsNomisMigrationService,
  nomisMigrationService,
  nomisPrisonerService,
}: {
  incidentsNomisMigrationService: IncidentsNomisMigrationService
  nomisMigrationService: NomisMigrationService
  nomisPrisonerService: NomisPrisonerService
}): Router {
  const router = express.Router({ mergeParams: true })
  router.use(authorisationMiddleware([MIGRATE_INCIDENT_REPORTS_ROLE, MIGRATE_NOMIS_SYSCON]))

  const get = (path: string, handler: RequestHandler) => router.get(path, asyncMiddleware(handler))
  const post = (path: string, handler: RequestHandler) => router.post(path, asyncMiddleware(handler))

  const incidentsMigrationController = new IncidentsMigrationController(
    incidentsNomisMigrationService,
    nomisMigrationService,
    nomisPrisonerService,
  )
  get('/', (req, res) => incidentsMigrationController.getIncidentsMigrations(req, res))
  get('/failures', (req, res) => incidentsMigrationController.viewFailures(req, res))
  get('/start', (req, res) => incidentsMigrationController.startNewIncidentsMigration(req, res))
  post('/start', (req, res) => incidentsMigrationController.postStartIncidentsMigration(req, res))
  get('/amend', (req, res) => incidentsMigrationController.startIncidentsMigration(req, res))
  get('/start/preview', (req, res) => incidentsMigrationController.startIncidentsMigrationPreview(req, res))
  post('/start/preview', (req, res) => incidentsMigrationController.postStartIncidentsMigrationPreview(req, res))
  post('/start/delete-failures', (req, res) =>
    incidentsMigrationController.postClearDLQIncidentsMigrationPreview(req, res),
  )
  get('/start/confirmation', (req, res) => incidentsMigrationController.startIncidentsMigrationConfirmation(req, res))
  get('/details', (req, res) => incidentsMigrationController.incidentsMigrationDetails(req, res))
  post('/cancel', (req, res) => incidentsMigrationController.cancelMigration(req, res))

  return router
}
