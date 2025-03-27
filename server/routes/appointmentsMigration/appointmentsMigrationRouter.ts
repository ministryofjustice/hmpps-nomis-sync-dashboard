import type { RequestHandler, Router } from 'express'

import asyncMiddleware from '../../middleware/asyncMiddleware'
import AppointmentsMigrationController from './appointmentsMigrationController'
import NomisMigrationService from '../../services/nomisMigrationService'
import NomisPrisonerService from '../../services/nomisPrisonerService'
import AppointmentsNomisMigrationService from '../../services/appointments/appointmentsNomisMigrationService'

export interface Services {
  appointmentsNomisMigrationService: AppointmentsNomisMigrationService
  nomisMigrationService: NomisMigrationService
  nomisPrisonerService: NomisPrisonerService
}
export default function routes(router: Router, services: Services): Router {
  const get = (path: string, handler: RequestHandler) => router.get(path, asyncMiddleware(handler))
  const post = (path: string, handler: RequestHandler) => router.post(path, asyncMiddleware(handler))

  const appointmentsMigrationController = new AppointmentsMigrationController(
    services.appointmentsNomisMigrationService,
    services.nomisMigrationService,
    services.nomisPrisonerService,
  )
  get('/appointments-migration', (req, res) => appointmentsMigrationController.getAppointmentsMigrations(req, res))
  get('/appointments-migration/failures', (req, res) => appointmentsMigrationController.viewFailures(req, res))
  get('/appointments-migration/start', (req, res) =>
    appointmentsMigrationController.startNewAppointmentsMigration(req, res),
  )
  post('/appointments-migration/start', (req, res) =>
    appointmentsMigrationController.postStartAppointmentsMigration(req, res),
  )
  get('/appointments-migration/amend', (req, res) =>
    appointmentsMigrationController.startAppointmentsMigration(req, res),
  )
  get('/appointments-migration/start/preview', (req, res) =>
    appointmentsMigrationController.startAppointmentsMigrationPreview(req, res),
  )
  post('/appointments-migration/start/preview', (req, res) =>
    appointmentsMigrationController.postStartAppointmentsMigrationPreview(req, res),
  )
  post('/appointments-migration/start/delete-faiures', (req, res) =>
    appointmentsMigrationController.postClearDLQAppointmentsMigrationPreview(req, res),
  )
  get('/appointments-migration/start/confirmation', (req, res) =>
    appointmentsMigrationController.startAppointmentsMigrationConfirmation(req, res),
  )
  get('/appointments-migration/details', (req, res) =>
    appointmentsMigrationController.appointmentsMigrationDetails(req, res),
  )
  post('/appointments-migration/cancel', (req, res) => appointmentsMigrationController.cancelMigration(req, res))
  get('/appointments-migration/activate-prison', (req, res) =>
    appointmentsMigrationController.postActivatePrison(req, res),
  )

  return router
}
