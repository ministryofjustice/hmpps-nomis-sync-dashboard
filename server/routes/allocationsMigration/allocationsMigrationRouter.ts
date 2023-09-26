import type { RequestHandler, Router } from 'express'

import asyncMiddleware from '../../middleware/asyncMiddleware'
import AllocationsMigrationController from './allocationsMigrationController'
import NomisMigrationService from '../../services/nomisMigrationService'
import NomisPrisonerService from '../../services/nomisPrisonerService'

export interface Services {
  nomisMigrationService: NomisMigrationService
  nomisPrisonerService: NomisPrisonerService
}
export default function routes(router: Router, services: Services): Router {
  const get = (path: string, handler: RequestHandler) => router.get(path, asyncMiddleware(handler))
  const post = (path: string, handler: RequestHandler) => router.post(path, asyncMiddleware(handler))

  const allocationsMigrationController = new AllocationsMigrationController(services.nomisMigrationService)
  get('/allocations-migration', (req, res) => allocationsMigrationController.getAllocationsMigrations(req, res))
  get('/allocations-migration/failures', (req, res) => allocationsMigrationController.viewFailures(req, res))
  get('/allocations-migration/start', (req, res) =>
    allocationsMigrationController.startNewAllocationsMigration(req, res),
  )
  post('/allocations-migration/start', (req, res) =>
    allocationsMigrationController.postStartAllocationsMigration(req, res),
  )
  get('/allocations-migration/amend', (req, res) => allocationsMigrationController.startAllocationsMigration(req, res))
  get('/allocations-migration/start/preview', (req, res) =>
    allocationsMigrationController.startAllocationsMigrationPreview(req, res),
  )
  post('/allocations-migration/start/preview', (req, res) =>
    allocationsMigrationController.postStartAllocationsMigrationPreview(req, res),
  )
  post('/allocations-migration/start/delete-faiures', (req, res) =>
    allocationsMigrationController.postClearDLQAllocationsMigrationPreview(req, res),
  )
  get('/allocations-migration/start/confirmation', (req, res) =>
    allocationsMigrationController.startAllocationsMigrationConfirmation(req, res),
  )
  get('/allocations-migration/details', (req, res) =>
    allocationsMigrationController.allocationsMigrationDetails(req, res),
  )
  post('/allocations-migration/cancel', (req, res) => allocationsMigrationController.cancelMigration(req, res))

  return router
}
