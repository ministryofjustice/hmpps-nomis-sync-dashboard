import express, { Router } from 'express'

import VisitBalanceNomisMigrationService from '../../services/visitbalance/visitBalanceNomisMigrationService'
import VisitBalanceNomisPrisonerService from '../../services/visitbalance/visitBalanceNomisPrisonerService'
import VisitBalanceMigrationController from './visitBalanceMigrationController'
import NomisMigrationService from '../../services/nomisMigrationService'
import authorisationMiddleware from '../../middleware/authorisationMiddleware'
import { MIGRATE_NOMIS_SYSCON, MIGRATE_VISIT_BALANCE_ROLE } from '../../authentication/roles'

export default function routes({
  visitBalanceNomisMigrationService,
  visitBalanceNomisPrisonerService,
  nomisMigrationService,
}: {
  visitBalanceNomisMigrationService: VisitBalanceNomisMigrationService
  visitBalanceNomisPrisonerService: VisitBalanceNomisPrisonerService
  nomisMigrationService: NomisMigrationService
}): Router {
  const router = express.Router({ mergeParams: true })
  router.use(authorisationMiddleware([MIGRATE_VISIT_BALANCE_ROLE, MIGRATE_NOMIS_SYSCON]))

  const migrationController = new VisitBalanceMigrationController(
    visitBalanceNomisMigrationService,
    visitBalanceNomisPrisonerService,
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
