import express, { RequestHandler, Router } from 'express'

import asyncMiddleware from '../../middleware/asyncMiddleware'
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

  const get = (path: string, handler: RequestHandler) => router.get(path, asyncMiddleware(handler))
  const post = (path: string, handler: RequestHandler) => router.post(path, asyncMiddleware(handler))

  const appointmentsMigrationController = new AppointmentsMigrationController(
    appointmentsNomisMigrationService,
    nomisMigrationService,
    nomisPrisonerService,
  )
  get('/', (req, res) => appointmentsMigrationController.getAppointmentsMigrations(req, res))
  get('/failures', (req, res) => appointmentsMigrationController.viewFailures(req, res))
  get('/start', (req, res) => appointmentsMigrationController.startNewAppointmentsMigration(req, res))
  post('/start', (req, res) => appointmentsMigrationController.postStartAppointmentsMigration(req, res))
  get('/amend', (req, res) => appointmentsMigrationController.startAppointmentsMigration(req, res))
  get('/start/preview', (req, res) => appointmentsMigrationController.startAppointmentsMigrationPreview(req, res))
  post('/start/preview', (req, res) => appointmentsMigrationController.postStartAppointmentsMigrationPreview(req, res))
  post('/start/delete-failures', (req, res) =>
    appointmentsMigrationController.postClearDLQAppointmentsMigrationPreview(req, res),
  )
  get('/start/confirmation', (req, res) =>
    appointmentsMigrationController.startAppointmentsMigrationConfirmation(req, res),
  )
  get('/details', (req, res) => appointmentsMigrationController.appointmentsMigrationDetails(req, res))
  post('/cancel', (req, res) => appointmentsMigrationController.cancelMigration(req, res))
  get('/activate-prison', (req, res) => appointmentsMigrationController.postActivatePrison(req, res))

  return router
}
