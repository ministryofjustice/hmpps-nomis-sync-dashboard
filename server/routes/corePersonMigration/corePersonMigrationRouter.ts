import express, { RequestHandler, Router } from 'express'

import asyncMiddleware from '../../middleware/asyncMiddleware'
import CorePersonNomisMigrationService from '../../services/coreperson/corePersonNomisMigrationService'
import NomisPrisonerService from '../../services/nomisPrisonerService'
import CorePersonMigrationController from './corePersonMigrationController'
import NomisMigrationService from '../../services/nomisMigrationService'
import authorisationMiddleware from '../../middleware/authorisationMiddleware'
import { MIGRATE_CORE_PERSON_ROLE, MIGRATE_NOMIS_SYSCON } from '../../authentication/roles'

export interface Services {
  corePersonNomisMigrationService: CorePersonNomisMigrationService
  nomisPrisonerService: NomisPrisonerService
  nomisMigrationService: NomisMigrationService
}
export default function routes({
  corePersonNomisMigrationService,
  nomisPrisonerService,
  nomisMigrationService,
}: {
  corePersonNomisMigrationService: CorePersonNomisMigrationService
  nomisPrisonerService: NomisPrisonerService
  nomisMigrationService: NomisMigrationService
}): Router {
  const router = express.Router({ mergeParams: true })
  router.use(authorisationMiddleware([MIGRATE_CORE_PERSON_ROLE, MIGRATE_NOMIS_SYSCON]))

  const get = (path: string, handler: RequestHandler) => router.get(path, asyncMiddleware(handler))
  const post = (path: string, handler: RequestHandler) => router.post(path, asyncMiddleware(handler))

  const migrationController = new CorePersonMigrationController(
    corePersonNomisMigrationService,
    nomisPrisonerService,
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
