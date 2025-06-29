import express, { Router } from 'express'

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

  const migrationController = new CorePersonMigrationController(
    corePersonNomisMigrationService,
    nomisPrisonerService,
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
