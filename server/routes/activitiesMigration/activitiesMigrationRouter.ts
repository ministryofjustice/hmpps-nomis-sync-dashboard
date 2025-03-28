import express from 'express'
import type { RequestHandler, Router } from 'express'

import asyncMiddleware from '../../middleware/asyncMiddleware'
import ActivitiesMigrationController from './activitiesMigrationController'
import NomisMigrationService from '../../services/nomisMigrationService'
import NomisPrisonerService from '../../services/nomisPrisonerService'
import ActivitiesService from '../../services/activitiesService'
import ActivitiesNomisMigrationService from '../../services/activities/activitiesNomisMigrationService'
import authorisationMiddleware from '../../middleware/authorisationMiddleware'
import { MIGRATE_ACTIVITIES_ROLE, MIGRATE_NOMIS_SYSCON } from '../../authentication/roles'

export default function routes({
  activitiesNomisMigrationService,
  nomisMigrationService,
  nomisPrisonerService,
  activitiesService,
}: {
  activitiesNomisMigrationService: ActivitiesNomisMigrationService
  nomisMigrationService: NomisMigrationService
  nomisPrisonerService: NomisPrisonerService
  activitiesService: ActivitiesService
}): Router {
  const router = express.Router({ mergeParams: true })
  router.use(authorisationMiddleware([MIGRATE_ACTIVITIES_ROLE, MIGRATE_NOMIS_SYSCON]))

  const get = (path: string, handler: RequestHandler) => router.get(path, asyncMiddleware(handler))
  const post = (path: string, handler: RequestHandler) => router.post(path, asyncMiddleware(handler))

  const activitiesMigrationController = new ActivitiesMigrationController(
    activitiesNomisMigrationService,
    nomisMigrationService,
    nomisPrisonerService,
    activitiesService,
  )
  get('/', (req, res) => activitiesMigrationController.getActivitiesMigrations(req, res))
  get('/start', (req, res) => activitiesMigrationController.startNewActivitiesMigration(req, res))
  post('/start', (req, res) => activitiesMigrationController.postStartActivitiesMigration(req, res))
  get('/amend', (req, res) => activitiesMigrationController.startActivitiesMigration(req, res))
  get('/start/preview', (req, res) => activitiesMigrationController.startActivitiesMigrationPreview(req, res))
  post('/start/preview', (req, res) => activitiesMigrationController.postStartActivitiesMigrationPreview(req, res))
  post('/start/delete-failures', (req, res) =>
    activitiesMigrationController.postClearDLQActivitiesMigrationPreview(req, res),
  )
  get('/start/confirmation', (req, res) => activitiesMigrationController.startActivitiesMigrationConfirmation(req, res))
  get('/details', (req, res) => activitiesMigrationController.activitiesMigrationDetails(req, res))
  post('/cancel', (req, res) => activitiesMigrationController.cancelMigration(req, res))
  get('/end-activities', (req, res) => activitiesMigrationController.postEndMigratedActivities(req, res))
  get('/activate-prison', (req, res) => activitiesMigrationController.postActivatePrison(req, res))
  return router
}
