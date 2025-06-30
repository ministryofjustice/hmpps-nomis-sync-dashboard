import express, { Router } from 'express'

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

  const incidentsMigrationController = new IncidentsMigrationController(
    incidentsNomisMigrationService,
    nomisMigrationService,
    nomisPrisonerService,
  )
  router.get('/', (req, res) => incidentsMigrationController.getIncidentsMigrations(req, res))
  router.get('/failures', (req, res) => incidentsMigrationController.viewFailures(req, res))
  router.get('/start', (req, res) => incidentsMigrationController.startNewIncidentsMigration(req, res))
  router.post('/start', (req, res) => incidentsMigrationController.postStartIncidentsMigration(req, res))
  router.get('/amend', (req, res) => incidentsMigrationController.startIncidentsMigration(req, res))
  router.get('/start/preview', (req, res) => incidentsMigrationController.startIncidentsMigrationPreview(req, res))
  router.post('/start/preview', (req, res) => incidentsMigrationController.postStartIncidentsMigrationPreview(req, res))
  router.post('/start/delete-failures', (req, res) =>
    incidentsMigrationController.postClearDLQIncidentsMigrationPreview(req, res),
  )
  router.get('/start/confirmation', (req, res) =>
    incidentsMigrationController.startIncidentsMigrationConfirmation(req, res),
  )
  router.get('/details', (req, res) => incidentsMigrationController.incidentsMigrationDetails(req, res))
  router.post('/cancel', (req, res) => incidentsMigrationController.cancelMigration(req, res))

  return router
}
