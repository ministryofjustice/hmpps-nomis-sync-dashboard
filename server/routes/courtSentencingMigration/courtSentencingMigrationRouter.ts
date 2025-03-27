import express, { RequestHandler, Router } from 'express'

import asyncMiddleware from '../../middleware/asyncMiddleware'
import CourtSentencingMigrationController from './courtSentencingMigrationController'
import NomisMigrationService from '../../services/nomisMigrationService'
import NomisPrisonerService from '../../services/nomisPrisonerService'
import CourtSentencingNomisMigrationService from '../../services/courtSentencing/courtSentencingNomisMigrationService'
import authorisationMiddleware from '../../middleware/authorisationMiddleware'
import { MIGRATE_NOMIS_SYSCON, MIGRATE_SENTENCING_ROLE } from '../../authentication/roles'

export default function routes({
  courtSentencingNomisMigrationService,
  nomisMigrationService,
  nomisPrisonerService,
}: {
  courtSentencingNomisMigrationService: CourtSentencingNomisMigrationService
  nomisMigrationService: NomisMigrationService
  nomisPrisonerService: NomisPrisonerService
}): Router {
  const router = express.Router({ mergeParams: true })
  router.use(authorisationMiddleware([MIGRATE_SENTENCING_ROLE, MIGRATE_NOMIS_SYSCON]))

  const get = (path: string, handler: RequestHandler) => router.get(path, asyncMiddleware(handler))
  const post = (path: string, handler: RequestHandler) => router.post(path, asyncMiddleware(handler))

  const courtSentencingMigrationController = new CourtSentencingMigrationController(
    courtSentencingNomisMigrationService,
    nomisMigrationService,
    nomisPrisonerService,
  )
  get('/', (req, res) => courtSentencingMigrationController.getCourtSentencingMigrations(req, res))
  get('/failures', (req, res) => courtSentencingMigrationController.viewFailures(req, res))
  get('/start', (req, res) => courtSentencingMigrationController.startNewCourtSentencingMigration(req, res))
  post('/start', (req, res) => courtSentencingMigrationController.postStartCourtSentencingMigration(req, res))
  get('/amend', (req, res) => courtSentencingMigrationController.startCourtSentencingMigration(req, res))
  get('/start/preview', (req, res) => courtSentencingMigrationController.startCourtSentencingMigrationPreview(req, res))
  post('/start/preview', (req, res) =>
    courtSentencingMigrationController.postStartCourtSentencingMigrationPreview(req, res),
  )
  post('/start/delete-failures', (req, res) =>
    courtSentencingMigrationController.postClearDLQCourtSentencingMigrationPreview(req, res),
  )
  get('/start/confirmation', (req, res) =>
    courtSentencingMigrationController.startCourtSentencingMigrationConfirmation(req, res),
  )
  get('/details', (req, res) => courtSentencingMigrationController.courtSentencingMigrationDetails(req, res))
  post('/cancel', (req, res) => courtSentencingMigrationController.cancelMigration(req, res))

  return router
}
