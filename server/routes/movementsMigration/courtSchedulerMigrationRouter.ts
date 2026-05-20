import express, { Router } from 'express'

import NomisMigrationService from '../../services/nomisMigrationService'
import authorisationMiddleware from '../../middleware/authorisationMiddleware'
import { MIGRATE_NOMIS_SYSCON } from '../../authentication/roles'
import CourtSchedulerMigrationController from './courtSchedulerMigrationController'
import MovementsNomisPrisonerService from '../../services/movements/movementsNomisPrisonerService'
import CourtSchedulerNomisMigrationService from '../../services/movements/courtSchedulerNomisMigrationService'

export default function routes({
  courtSchedulerNomisMigrationService,
  movementsNomisPrisonerService,
  nomisMigrationService,
}: {
  courtSchedulerNomisMigrationService: CourtSchedulerNomisMigrationService
  movementsNomisPrisonerService: MovementsNomisPrisonerService
  nomisMigrationService: NomisMigrationService
}): Router {
  const router = express.Router({ mergeParams: true })
  router.use(authorisationMiddleware([MIGRATE_NOMIS_SYSCON]))

  const migrationController = new CourtSchedulerMigrationController(
    courtSchedulerNomisMigrationService,
    movementsNomisPrisonerService,
    nomisMigrationService,
  )

  router.get('/', (req, res) => migrationController.getMigrations(req, res))
  router.get('/start', (req, res) => migrationController.startNewMigration(req, res))
  router.post('/start', (req, res) => migrationController.postStartMigration(req, res))
  router.get('/amend', (req, res) => migrationController.startMigration(req, res))
  router.get('/start/preview', (req, res) => migrationController.startMigrationPreview(req, res))
  router.post('/start/preview', (req, res) => migrationController.postStartMigrationPreview(req, res))
  router.post('/start/delete-failures', (req, res) => migrationController.postClearDLQMigrationPreview(req, res))
  router.get('/start/confirmation', (req, res) => migrationController.startMigrationConfirmation(req, res))
  router.get('/details', (req, res) => migrationController.migrationDetails(req, res))
  router.post('/cancel', (req, res) => migrationController.cancelMigration(req, res))

  return router
}
