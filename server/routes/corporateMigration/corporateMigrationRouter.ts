import express, { RequestHandler, Router } from 'express'

import asyncMiddleware from '../../middleware/asyncMiddleware'
import CorporateNomisMigrationService from '../../services/corporate/corporateNomisMigrationService'
import CorporateNomisPrisonerService from '../../services/corporate/corporateNomisPrisonerService'
import CorporateMigrationController from './corporateMigrationController'
import NomisMigrationService from '../../services/nomisMigrationService'
import authorisationMiddleware from '../../middleware/authorisationMiddleware'
import { MIGRATE_CONTACTPERSON_ROLE, MIGRATE_NOMIS_SYSCON } from '../../authentication/roles'

export interface Services {
  corporateNomisMigrationService: CorporateNomisMigrationService
  corporateNomisPrisonerService: CorporateNomisPrisonerService
  nomisMigrationService: NomisMigrationService
}
export default function routes({
  corporateNomisMigrationService,
  corporateNomisPrisonerService,
  nomisMigrationService,
}: {
  corporateNomisMigrationService: CorporateNomisMigrationService
  corporateNomisPrisonerService: CorporateNomisPrisonerService
  nomisMigrationService: NomisMigrationService
}): Router {
  const router = express.Router({ mergeParams: true })
  router.use(authorisationMiddleware([MIGRATE_CONTACTPERSON_ROLE, MIGRATE_NOMIS_SYSCON]))

  const get = (path: string, handler: RequestHandler) => router.get(path, asyncMiddleware(handler))
  const post = (path: string, handler: RequestHandler) => router.post(path, asyncMiddleware(handler))

  const migrationController = new CorporateMigrationController(
    corporateNomisMigrationService,
    corporateNomisPrisonerService,
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
