import express, { Router } from 'express'

import AdvancesNomisMigrationService from '../../services/advances/advancesNomisMigrationService'
import AdvancesNomisPrisonerService from '../../services/advances/advancesNomisPrisonerService'
import AdvancesMigrationController from './advancesMigrationController'
import NomisMigrationService from '../../services/nomisMigrationService'
import authorisationMiddleware from '../../middleware/authorisationMiddleware'
import { MIGRATE_NOMIS_SYSCON } from '../../authentication/roles'

export default function routes({
  advancesNomisMigrationService,
  advancesNomisPrisonerService,
  nomisMigrationService,
}: {
  advancesNomisMigrationService: AdvancesNomisMigrationService
  advancesNomisPrisonerService: AdvancesNomisPrisonerService
  nomisMigrationService: NomisMigrationService
}): Router {
  const router = express.Router({ mergeParams: true })
  router.use(authorisationMiddleware([MIGRATE_NOMIS_SYSCON]))

  const migrationController = new AdvancesMigrationController(
    advancesNomisMigrationService,
    advancesNomisPrisonerService,
    nomisMigrationService,
  )
  router.get('/', (req, res) => migrationController.getMigrations(req, res))
  router.get('/failures', (req, res) => migrationController.viewFailures(req, res))
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
