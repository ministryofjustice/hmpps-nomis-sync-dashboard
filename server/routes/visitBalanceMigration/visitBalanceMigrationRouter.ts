import express, { RequestHandler, Router } from 'express'

import asyncMiddleware from '../../middleware/asyncMiddleware'
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

  const get = (path: string, handler: RequestHandler) => router.get(path, asyncMiddleware(handler))
  const post = (path: string, handler: RequestHandler) => router.post(path, asyncMiddleware(handler))

  const migrationController = new VisitBalanceMigrationController(
    visitBalanceNomisMigrationService,
    visitBalanceNomisPrisonerService,
    nomisMigrationService,
  )
  get('/', (req, res) => migrationController.getMigrations(req, res))
  get('/failures', (req, res) => migrationController.viewFailures(req, res))
  get('/start', (req, res) => migrationController.startNewMigration(req, res))
  post('/start', (req, res) => migrationController.postStartMigration(req, res))
  get('/amend', (req, res) => migrationController.startMigration(req, res))
  get('/start/preview', (req, res) => migrationController.startMigrationPreview(req, res))
  post('/start/preview', (req, res) => migrationController.postStartMigrationPreview(req, res))
  post('/start/delete-failures', (req, res) => migrationController.postClearDLQMigrationPreview(req, res))
  get('/start/confirmation', (req, res) => migrationController.startMigrationConfirmation(req, res))
  get('/details', (req, res) => migrationController.migrationDetails(req, res))
  post('/cancel', (req, res) => migrationController.cancelMigration(req, res))

  return router
}
