import express, { RequestHandler, Router } from 'express'

import asyncMiddleware from '../../middleware/asyncMiddleware'
import RoomMappingController from '../roomMappings/roomMappingController'

import NomisPrisonerService from '../../services/nomisPrisonerService'
import authorisationMiddleware from '../../middleware/authorisationMiddleware'
import { MIGRATE_NOMIS_SYSCON, MIGRATE_VISITS_ROLE } from '../../authentication/roles'
import MappingService from '../../services/mappingService'

export default function routes({
  nomisPrisonerService,
  mappingService,
}: {
  nomisPrisonerService: NomisPrisonerService
  mappingService: MappingService
}): Router {
  const router = express.Router({ mergeParams: true })
  router.use(authorisationMiddleware([MIGRATE_VISITS_ROLE, MIGRATE_NOMIS_SYSCON]))

  const get = (path: string, handler: RequestHandler) => router.get(path, asyncMiddleware(handler))
  const post = (path: string, handler: RequestHandler) => router.post(path, asyncMiddleware(handler))

  const mappingController = new RoomMappingController(mappingService, nomisPrisonerService)

  get('/', (req, res) => mappingController.getVisitRoomMappings(req, res))
  get('/prison', (req, res) => mappingController.getPrison(req, res))
  post('/add/preview', (req, res) => mappingController.addVisitRoomMapping(req, res))
  post('/delete', (req, res) => mappingController.deleteVisitRoomMapping(req, res))
  post('/add', (req, res) => mappingController.postAddVisitRoomMapping(req, res))

  return router
}
