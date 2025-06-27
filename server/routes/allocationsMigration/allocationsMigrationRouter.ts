import express, { Router } from 'express'

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

  const allocationsMigrationController = new AllocationsMigrationController(
    allocationsNomisMigrationService,
    nomisMigrationService,
    nomisPrisonerService,
  )
  router.get('/', (req, res) => allocationsMigrationController.getAllocationsMigrations(req, res))
  router.get('/start', (req, res) => allocationsMigrationController.startNewAllocationsMigration(req, res))
  router.post('/start', (req, res) => allocationsMigrationController.postStartAllocationsMigration(req, res))
  router.get('/amend', (req, res) => allocationsMigrationController.startAllocationsMigration(req, res))
  router.get('/start/preview', (req, res) => allocationsMigrationController.startAllocationsMigrationPreview(req, res))
  router.post('/start/preview', (req, res) =>
    allocationsMigrationController.postStartAllocationsMigrationPreview(req, res),
  )
  router.post('/start/delete-failures', (req, res) =>
    allocationsMigrationController.postClearDLQAllocationsMigrationPreview(req, res),
  )
  router.get('/start/confirmation', (req, res) =>
    allocationsMigrationController.startAllocationsMigrationConfirmation(req, res),
  )
  router.get('/details', (req, res) => allocationsMigrationController.allocationsMigrationDetails(req, res))
  router.post('/cancel', (req, res) => allocationsMigrationController.cancelMigration(req, res))

  return router
}
