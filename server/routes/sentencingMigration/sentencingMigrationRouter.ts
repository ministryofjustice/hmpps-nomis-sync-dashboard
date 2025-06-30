import express, { Router } from 'express'

import SentencingMigrationController from './sentencingMigrationController'
import NomisMigrationService from '../../services/nomisMigrationService'
import NomisPrisonerService from '../../services/nomisPrisonerService'
import SentencingNomisMigrationService from '../../services/sentencing/sentencingNomisMigrationService'
import authorisationMiddleware from '../../middleware/authorisationMiddleware'
import { MIGRATE_NOMIS_SYSCON, MIGRATE_SENTENCING_ROLE } from '../../authentication/roles'

export default function routes({
  sentencingNomisMigrationService,
  nomisMigrationService,
  nomisPrisonerService,
}: {
  sentencingNomisMigrationService: SentencingNomisMigrationService
  nomisMigrationService: NomisMigrationService
  nomisPrisonerService: NomisPrisonerService
}): Router {
  const router = express.Router({ mergeParams: true })
  router.use(authorisationMiddleware([MIGRATE_SENTENCING_ROLE, MIGRATE_NOMIS_SYSCON]))

  const sentencingMigrationController = new SentencingMigrationController(
    sentencingNomisMigrationService,
    nomisMigrationService,
    nomisPrisonerService,
  )
  router.get('/', (req, res) => sentencingMigrationController.getSentencingMigrations(req, res))
  router.get('/failures', (req, res) => sentencingMigrationController.viewFailures(req, res))
  router.get('/start', (req, res) => sentencingMigrationController.startNewSentencingMigration(req, res))
  router.post('/start', (req, res) => sentencingMigrationController.postStartSentencingMigration(req, res))
  router.get('/amend', (req, res) => sentencingMigrationController.startSentencingMigration(req, res))
  router.get('/start/preview', (req, res) => sentencingMigrationController.startSentencingMigrationPreview(req, res))
  router.post('/start/preview', (req, res) =>
    sentencingMigrationController.postStartSentencingMigrationPreview(req, res),
  )
  router.post('/start/delete-failures', (req, res) =>
    sentencingMigrationController.postClearDLQSentencingMigrationPreview(req, res),
  )
  router.get('/start/confirmation', (req, res) =>
    sentencingMigrationController.startSentencingMigrationConfirmation(req, res),
  )
  router.get('/details', (req, res) => sentencingMigrationController.sentencingMigrationDetails(req, res))
  router.post('/cancel', (req, res) => sentencingMigrationController.cancelMigration(req, res))

  return router
}
