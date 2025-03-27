import express, { RequestHandler, Router } from 'express'

import asyncMiddleware from '../../middleware/asyncMiddleware'
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

  const get = (path: string, handler: RequestHandler) => router.get(path, asyncMiddleware(handler))
  const post = (path: string, handler: RequestHandler) => router.post(path, asyncMiddleware(handler))

  const sentencingMigrationController = new SentencingMigrationController(
    sentencingNomisMigrationService,
    nomisMigrationService,
    nomisPrisonerService,
  )
  get('/', (req, res) => sentencingMigrationController.getSentencingMigrations(req, res))
  get('/failures', (req, res) => sentencingMigrationController.viewFailures(req, res))
  get('/start', (req, res) => sentencingMigrationController.startNewSentencingMigration(req, res))
  post('/start', (req, res) => sentencingMigrationController.postStartSentencingMigration(req, res))
  get('/amend', (req, res) => sentencingMigrationController.startSentencingMigration(req, res))
  get('/start/preview', (req, res) => sentencingMigrationController.startSentencingMigrationPreview(req, res))
  post('/start/preview', (req, res) => sentencingMigrationController.postStartSentencingMigrationPreview(req, res))
  post('/start/delete-failures', (req, res) =>
    sentencingMigrationController.postClearDLQSentencingMigrationPreview(req, res),
  )
  get('/start/confirmation', (req, res) => sentencingMigrationController.startSentencingMigrationConfirmation(req, res))
  get('/details', (req, res) => sentencingMigrationController.sentencingMigrationDetails(req, res))
  post('/cancel', (req, res) => sentencingMigrationController.cancelMigration(req, res))

  return router
}
