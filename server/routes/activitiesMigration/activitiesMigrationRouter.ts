import express from 'express'
import type { Router } from 'express'

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

  const activitiesMigrationController = new ActivitiesMigrationController(
    activitiesNomisMigrationService,
    nomisMigrationService,
    nomisPrisonerService,
    activitiesService,
  )
  router.get('/', (req, res) => activitiesMigrationController.getActivitiesMigrations(req, res))
  router.get('/start', (req, res) => activitiesMigrationController.startNewActivitiesMigration(req, res))
  router.post('/start', (req, res) => activitiesMigrationController.postStartActivitiesMigration(req, res))
  router.get('/amend', (req, res) => activitiesMigrationController.startActivitiesMigration(req, res))
  router.get('/start/preview', (req, res) => activitiesMigrationController.startActivitiesMigrationPreview(req, res))
  router.post('/start/preview', (req, res) =>
    activitiesMigrationController.postStartActivitiesMigrationPreview(req, res),
  )
  router.post('/start/delete-failures', (req, res) =>
    activitiesMigrationController.postClearDLQActivitiesMigrationPreview(req, res),
  )
  router.get('/start/confirmation', (req, res) =>
    activitiesMigrationController.startActivitiesMigrationConfirmation(req, res),
  )
  router.get('/details', (req, res) => activitiesMigrationController.activitiesMigrationDetails(req, res))
  router.post('/cancel', (req, res) => activitiesMigrationController.cancelMigration(req, res))
  router.get('/end-activities', (req, res) => activitiesMigrationController.postEndMigratedActivities(req, res))
  router.get('/move-start-date/start', (req, res) => activitiesMigrationController.startMoveStartDate(req, res))
  router.get('/move-start-date/amend', (req, res) => activitiesMigrationController.moveStartDate(req, res))
  router.post('/move-start-date', (req, res) => activitiesMigrationController.postMoveStartDate(req, res))
  router.get('/activate-prison', (req, res) => activitiesMigrationController.postActivatePrison(req, res))
  return router
}
