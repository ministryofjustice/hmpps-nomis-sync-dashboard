import express, { RequestHandler, Router } from 'express'

import asyncMiddleware from '../../middleware/asyncMiddleware'
import AllocationsMigrationController from './allocationsMigrationController'
import NomisMigrationService from '../../services/nomisMigrationService'
import NomisPrisonerService from '../../services/nomisPrisonerService'
import AllocationsNomisMigrationService from '../../services/allocations/allocationsNomisMigrationService'
import authorisationMiddleware from '../../middleware/authorisationMiddleware'
import { MIGRATE_ALLOCATIONS_ROLE, MIGRATE_NOMIS_SYSCON } from '../../authentication/roles'

export default function routes({
  allocationsNomisMigrationService,
  nomisMigrationService,
  nomisPrisonerService,
}: {
  allocationsNomisMigrationService: AllocationsNomisMigrationService
  nomisMigrationService: NomisMigrationService
  nomisPrisonerService: NomisPrisonerService
}): Router {
  const router = express.Router({ mergeParams: true })
  router.use(authorisationMiddleware([MIGRATE_ALLOCATIONS_ROLE, MIGRATE_NOMIS_SYSCON]))

  const get = (path: string, handler: RequestHandler) => router.get(path, asyncMiddleware(handler))
  const post = (path: string, handler: RequestHandler) => router.post(path, asyncMiddleware(handler))

  const allocationsMigrationController = new AllocationsMigrationController(
    allocationsNomisMigrationService,
    nomisMigrationService,
    nomisPrisonerService,
  )
  get('/', (req, res) => allocationsMigrationController.getAllocationsMigrations(req, res))
  get('/start', (req, res) => allocationsMigrationController.startNewAllocationsMigration(req, res))
  post('/start', (req, res) => allocationsMigrationController.postStartAllocationsMigration(req, res))
  get('/amend', (req, res) => allocationsMigrationController.startAllocationsMigration(req, res))
  get('/start/preview', (req, res) => allocationsMigrationController.startAllocationsMigrationPreview(req, res))
  post('/start/preview', (req, res) => allocationsMigrationController.postStartAllocationsMigrationPreview(req, res))
  post('/start/delete-failures', (req, res) =>
    allocationsMigrationController.postClearDLQAllocationsMigrationPreview(req, res),
  )
  get('/start/confirmation', (req, res) =>
    allocationsMigrationController.startAllocationsMigrationConfirmation(req, res),
  )
  get('/details', (req, res) => allocationsMigrationController.allocationsMigrationDetails(req, res))
  post('/cancel', (req, res) => allocationsMigrationController.cancelMigration(req, res))

  return router
}
