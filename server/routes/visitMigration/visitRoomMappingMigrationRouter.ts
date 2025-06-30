import express, { Router } from 'express'

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

  const mappingController = new RoomMappingController(mappingService, nomisPrisonerService)

  router.get('/', (req, res) => mappingController.getVisitRoomMappings(req, res))
  router.get('/prison', (req, res) => mappingController.getPrison(req, res))
  router.post('/add/preview', (req, res) => mappingController.addVisitRoomMapping(req, res))
  router.post('/delete', (req, res) => mappingController.deleteVisitRoomMapping(req, res))
  router.post('/add', (req, res) => mappingController.postAddVisitRoomMapping(req, res))

  return router
}
