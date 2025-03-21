import type { RequestHandler, Router } from 'express'

import asyncMiddleware from '../../middleware/asyncMiddleware'
import VisitBalanceNomisMigrationService from '../../services/visitbalance/visitBalanceNomisMigrationService'
import VisitBalanceNomisPrisonerService from '../../services/visitbalance/visitBalanceNomisPrisonerService'
import VisitBalanceMigrationController from './visitBalanceMigrationController'
import NomisMigrationService from '../../services/nomisMigrationService'

export interface Services {
  visitBalanceNomisMigrationService: VisitBalanceNomisMigrationService
  visitBalanceNomisPrisonerService: VisitBalanceNomisPrisonerService
  nomisMigrationService: NomisMigrationService
}
export default function routes(router: Router, services: Services): Router {
  const get = (path: string, handler: RequestHandler) => router.get(path, asyncMiddleware(handler))
  const post = (path: string, handler: RequestHandler) => router.post(path, asyncMiddleware(handler))

  const migrationController = new VisitBalanceMigrationController(
    services.visitBalanceNomisMigrationService,
    services.visitBalanceNomisPrisonerService,
    services.nomisMigrationService,
  )
  get('/visit-balance-migration', (req, res) => migrationController.getMigrations(req, res))
  get('/visit-balance-migration/failures', (req, res) => migrationController.viewFailures(req, res))
  get('/visit-balance-migration/start', (req, res) => migrationController.startNewMigration(req, res))
  post('/visit-balance-migration/start', (req, res) => migrationController.postStartMigration(req, res))
  get('/visit-balance-migration/amend', (req, res) => migrationController.startMigration(req, res))
  get('/visit-balance-migration/start/preview', (req, res) => migrationController.startMigrationPreview(req, res))
  post('/visit-balance-migration/start/preview', (req, res) => migrationController.postStartMigrationPreview(req, res))
  post('/visit-balance-migration/start/delete-faiures', (req, res) =>
    migrationController.postClearDLQMigrationPreview(req, res),
  )
  get('/visit-balance-migration/start/confirmation', (req, res) =>
    migrationController.startMigrationConfirmation(req, res),
  )
  get('/visit-balance-migration/details', (req, res) => migrationController.migrationDetails(req, res))
  post('/visit-balance-migration/cancel', (req, res) => migrationController.cancelMigration(req, res))

  return router
}
