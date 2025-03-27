import express, { RequestHandler, Router } from 'express'

import asyncMiddleware from '../../middleware/asyncMiddleware'
import VisitsMigrationController from './visitsMigrationController'

import NomisMigrationService from '../../services/nomisMigrationService'
import NomisPrisonerService from '../../services/nomisPrisonerService'
import authorisationMiddleware from '../../middleware/authorisationMiddleware'
import { MIGRATE_NOMIS_SYSCON, MIGRATE_VISITS_ROLE } from '../../authentication/roles'
import VisitsNomisMigrationService from '../../services/visits/visitsNomisMigrationService'

export default function routes({
  visitsNomisMigrationService,
  nomisMigrationService,
  nomisPrisonerService,
}: {
  visitsNomisMigrationService: VisitsNomisMigrationService
  nomisMigrationService: NomisMigrationService
  nomisPrisonerService: NomisPrisonerService
}): Router {
  const router = express.Router({ mergeParams: true })
  router.use(authorisationMiddleware([MIGRATE_VISITS_ROLE, MIGRATE_NOMIS_SYSCON]))

  const get = (path: string, handler: RequestHandler) => router.get(path, asyncMiddleware(handler))
  const post = (path: string, handler: RequestHandler) => router.post(path, asyncMiddleware(handler))

  const visitMigrationController = new VisitsMigrationController(
    visitsNomisMigrationService,
    nomisMigrationService,
    nomisPrisonerService,
  )

  get('/', (req, res) => visitMigrationController.getVisitMigrations(req, res))
  get('/start', (req, res) => visitMigrationController.startNewVisitMigration(req, res))
  get('/amend', (req, res) => visitMigrationController.startVisitMigration(req, res))
  post('/start', (req, res) => visitMigrationController.postStartVisitMigration(req, res))
  post('/start/delete-failures', (req, res) => visitMigrationController.postClearDLQVisitMigrationPreview(req, res))
  get('/start/preview', (req, res) => visitMigrationController.startVisitMigrationPreview(req, res))
  post('/start/preview', (req, res) => visitMigrationController.postStartVisitMigrationPreview(req, res))
  get('/start/confirmation', (req, res) => visitMigrationController.startVisitMigrationConfirmation(req, res))
  get('/failures', (req, res) => visitMigrationController.viewFailures(req, res))
  get('/details', (req, res) => visitMigrationController.visitsMigrationDetails(req, res))
  post('/cancel', (req, res) => visitMigrationController.cancelMigration(req, res))

  return router
}
