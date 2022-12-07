import type { RequestHandler, Router } from 'express'

import asyncMiddleware from '../../middleware/asyncMiddleware'
import VisitsMigrationController from './visitsMigrationController'
import RoomMappingController from '../roomMappings/roomMappingController'

import { Services } from '../../services'

export default function routes(
  router: Router,
  { nomisMigrationService, nomisPrisonerService, mappingService }: Services
): Router {
  const get = (path: string, handler: RequestHandler) => router.get(path, asyncMiddleware(handler))
  const post = (path: string, handler: RequestHandler) => router.post(path, asyncMiddleware(handler))

  const visitMigrationController = new VisitsMigrationController(nomisMigrationService, nomisPrisonerService)

  const mappingController = new RoomMappingController(mappingService, nomisPrisonerService)

  get('/visits-migration', (req, res) => visitMigrationController.getVisitMigrations(req, res))
  get('/visits-migration/start', (req, res) => visitMigrationController.startNewVisitMigration(req, res))
  get('/visits-migration/amend', (req, res) => visitMigrationController.startVisitMigration(req, res))
  post('/visits-migration/start', (req, res) => visitMigrationController.postStartVisitMigration(req, res))
  post('/visits-migration/start/delete-faiures', (req, res) =>
    visitMigrationController.postClearDLQVisitMigrationPreview(req, res)
  )
  get('/visits-migration/start/preview', (req, res) => visitMigrationController.startVisitMigrationPreview(req, res))
  post('/visits-migration/start/preview', (req, res) =>
    visitMigrationController.postStartVisitMigrationPreview(req, res)
  )
  get('/visits-migration/start/confirmation', (req, res) =>
    visitMigrationController.startVisitMigrationConfirmation(req, res)
  )
  get('/visits-migration/failures', (req, res) => visitMigrationController.viewFailures(req, res))
  get('/visits-migration/details', (req, res) => visitMigrationController.visitsMigrationDetails(req, res))
  post('/visits-migration/cancel', (req, res) => visitMigrationController.cancelMigration(req, res))

  get('/visits-room-mappings', (req, res) => mappingController.getVisitRoomMappings(req, res))
  get('/visits-room-mappings-prison', (req, res) => mappingController.getPrison(req, res))
  post('/visits-room-mappings/add/preview', (req, res) => mappingController.addVisitRoomMapping(req, res))
  post('/visits-room-mappings/delete', (req, res) => mappingController.deleteVisitRoomMapping(req, res))
  post('/visits-room-mappings/add', (req, res) => mappingController.postAddVisitRoomMapping(req, res))

  return router
}
