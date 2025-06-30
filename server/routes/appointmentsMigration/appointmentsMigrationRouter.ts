import express, { Router } from 'express'

import AppointmentsMigrationController from './appointmentsMigrationController'
import NomisMigrationService from '../../services/nomisMigrationService'
import NomisPrisonerService from '../../services/nomisPrisonerService'
import AppointmentsNomisMigrationService from '../../services/appointments/appointmentsNomisMigrationService'
import authorisationMiddleware from '../../middleware/authorisationMiddleware'
import { MIGRATE_APPOINTMENTS_ROLE, MIGRATE_NOMIS_SYSCON } from '../../authentication/roles'

export default function routes({
  appointmentsNomisMigrationService,
  nomisMigrationService,
  nomisPrisonerService,
}: {
  appointmentsNomisMigrationService: AppointmentsNomisMigrationService
  nomisMigrationService: NomisMigrationService
  nomisPrisonerService: NomisPrisonerService
}): Router {
  const router = express.Router({ mergeParams: true })
  router.use(authorisationMiddleware([MIGRATE_APPOINTMENTS_ROLE, MIGRATE_NOMIS_SYSCON]))

  const appointmentsMigrationController = new AppointmentsMigrationController(
    appointmentsNomisMigrationService,
    nomisMigrationService,
    nomisPrisonerService,
  )
  router.get('/', (req, res) => appointmentsMigrationController.getAppointmentsMigrations(req, res))
  router.get('/failures', (req, res) => appointmentsMigrationController.viewFailures(req, res))
  router.get('/start', (req, res) => appointmentsMigrationController.startNewAppointmentsMigration(req, res))
  router.post('/start', (req, res) => appointmentsMigrationController.postStartAppointmentsMigration(req, res))
  router.get('/amend', (req, res) => appointmentsMigrationController.startAppointmentsMigration(req, res))
  router.get('/start/preview', (req, res) =>
    appointmentsMigrationController.startAppointmentsMigrationPreview(req, res),
  )
  router.post('/start/preview', (req, res) =>
    appointmentsMigrationController.postStartAppointmentsMigrationPreview(req, res),
  )
  router.post('/start/delete-failures', (req, res) =>
    appointmentsMigrationController.postClearDLQAppointmentsMigrationPreview(req, res),
  )
  router.get('/start/confirmation', (req, res) =>
    appointmentsMigrationController.startAppointmentsMigrationConfirmation(req, res),
  )
  router.get('/details', (req, res) => appointmentsMigrationController.appointmentsMigrationDetails(req, res))
  router.post('/cancel', (req, res) => appointmentsMigrationController.cancelMigration(req, res))
  router.get('/activate-prison', (req, res) => appointmentsMigrationController.postActivatePrison(req, res))

  return router
}
