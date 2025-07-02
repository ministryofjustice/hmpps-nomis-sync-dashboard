import express, { Router } from 'express'

import VisitsMigrationController from './visitsMigrationController'

import NomisMigrationService from '../../services/nomisMigrationService'
import NomisPrisonerService from '../../services/nomisPrisonerService'
import authorisationMiddleware from '../../middleware/authorisationMiddleware'
import { MIGRATE_NOMIS_SYSCON, MIGRATE_VISITS_ROLE } from '../../authentication/roles'
import VisitsNomisMigrationService from '../../services/visits/visitsNomisMigrationService'

export default function routes({
  visitsNomisMigrationService,
  nomisMigrationService,
  nomisPrisonerService,
}: {
  visitsNomisMigrationService: VisitsNomisMigrationService
  nomisMigrationService: NomisMigrationService
  nomisPrisonerService: NomisPrisonerService
}): Router {
  const router = express.Router({ mergeParams: true })
  router.use(authorisationMiddleware([MIGRATE_VISITS_ROLE, MIGRATE_NOMIS_SYSCON]))

  const visitMigrationController = new VisitsMigrationController(
    visitsNomisMigrationService,
    nomisMigrationService,
    nomisPrisonerService,
  )

  router.get('/', (req, res) => visitMigrationController.getVisitMigrations(req, res))
  router.get('/start', (req, res) => visitMigrationController.startNewVisitMigration(req, res))
  router.get('/amend', (req, res) => visitMigrationController.startVisitMigration(req, res))
  router.post('/start', (req, res) => visitMigrationController.postStartVisitMigration(req, res))
  router.post('/start/delete-failures', (req, res) =>
    visitMigrationController.postClearDLQVisitMigrationPreview(req, res),
  )
  router.get('/start/preview', (req, res) => visitMigrationController.startVisitMigrationPreview(req, res))
  router.post('/start/preview', (req, res) => visitMigrationController.postStartVisitMigrationPreview(req, res))
  router.get('/start/confirmation', (req, res) => visitMigrationController.startVisitMigrationConfirmation(req, res))
  router.get('/failures', (req, res) => visitMigrationController.viewFailures(req, res))
  router.get('/details', (req, res) => visitMigrationController.visitsMigrationDetails(req, res))
  router.post('/cancel', (req, res) => visitMigrationController.cancelMigration(req, res))

  return router
}
