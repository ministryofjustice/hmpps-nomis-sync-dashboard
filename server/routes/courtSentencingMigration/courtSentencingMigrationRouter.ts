import express, { Router } from 'express'

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

  const courtSentencingMigrationController = new CourtSentencingMigrationController(
    courtSentencingNomisMigrationService,
    nomisMigrationService,
    nomisPrisonerService,
  )
  router.get('/', (req, res) => courtSentencingMigrationController.getCourtSentencingMigrations(req, res))
  router.get('/failures', (req, res) => courtSentencingMigrationController.viewFailures(req, res))
  router.get('/start', (req, res) => courtSentencingMigrationController.startNewCourtSentencingMigration(req, res))
  router.post('/start', (req, res) => courtSentencingMigrationController.postStartCourtSentencingMigration(req, res))
  router.get('/amend', (req, res) => courtSentencingMigrationController.startCourtSentencingMigration(req, res))
  router.get('/start/preview', (req, res) =>
    courtSentencingMigrationController.startCourtSentencingMigrationPreview(req, res),
  )
  router.post('/start/preview', (req, res) =>
    courtSentencingMigrationController.postStartCourtSentencingMigrationPreview(req, res),
  )
  router.post('/start/delete-failures', (req, res) =>
    courtSentencingMigrationController.postClearDLQCourtSentencingMigrationPreview(req, res),
  )
  router.get('/start/confirmation', (req, res) =>
    courtSentencingMigrationController.startCourtSentencingMigrationConfirmation(req, res),
  )
  router.get('/details', (req, res) => courtSentencingMigrationController.courtSentencingMigrationDetails(req, res))
  router.post('/cancel', (req, res) => courtSentencingMigrationController.cancelMigration(req, res))

  return router
}
