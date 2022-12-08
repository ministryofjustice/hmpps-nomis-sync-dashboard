import { Request, Response } from 'express'
import { Context } from '../../services/nomisMigrationService'
import NomisPrisonerService from '../../services/nomisPrisonerService'
import MappingService from '../../services/mappingService'
import addRoomMappingValidator from './addRoomMappingValidator'
import roomMappingPrisonValidator from './roomMappingPrisonValidator'

function context(res: Response): Context {
  return {
    username: res?.locals?.user?.username,
    token: res?.locals?.user?.token,
  }
}

export default class RoomMappingController {
  constructor(
    private readonly mappingService: MappingService,
    private readonly nomisPrisonerService: NomisPrisonerService,
  ) {}

  async getVisitRoomMappings(req: Request, res: Response): Promise<void> {
    const { prisonId, futureVisits } = req.query as { prisonId: string; futureVisits: string }
    const errors = roomMappingPrisonValidator(prisonId)
    if (errors.length > 0) {
      res.render('pages/visits/roomMappingPrison', { futureVisits: futureVisits === 'true', errors })
    } else {
      await this.viewMappings(prisonId.toUpperCase(), futureVisits === 'true', res)
    }
  }

  private async viewMappings(prisonId: string, futureVisits: boolean, res: Response) {
    const mappings = await this.mappingService.getVisitRoomMappings(prisonId, context(res))
    const nomisVisitRooms = await this.nomisPrisonerService.getVisitRooms(prisonId, futureVisits, context(res))

    const rooms = nomisVisitRooms.map(nomisRoom => ({
      ...nomisRoom,
      ...mappings.find(mapping => mapping.nomisRoomDescription === nomisRoom.agencyInternalLocationDescription),
    }))

    res.render('pages/visits/viewRoomMappings', {
      rooms,
      prisonId,
      futureVisits,
    })
  }

  getPrison(req: Request, res: Response): void {
    res.render('pages/visits/roomMappingPrison', { futureVisits: true, errors: [] })
  }

  async addVisitRoomMapping(req: Request, res: Response) {
    const {
      prisonId,
      nomisRoomDescription,
      futureVisits,
    }: { prisonId: string; nomisRoomDescription: string; futureVisits: boolean } = req.body
    res.render('pages/visits/addRoomMapping', { prisonId, futureVisits, nomisRoomDescription, errors: [] })
  }

  async deleteVisitRoomMapping(req: Request, res: Response) {
    const {
      prisonId,
      nomisRoomDescription,
      futureVisits,
    }: { prisonId: string; nomisRoomDescription: string; futureVisits: boolean } = req.body
    await this.mappingService.deleteVisitRoomMappings(prisonId, nomisRoomDescription, context(res))
    res.redirect(`/visits-room-mappings/?prisonId=${prisonId}&futureVisits=${futureVisits}`)
  }

  async postAddVisitRoomMapping(req: Request, res: Response) {
    const {
      prisonId,
      nomisRoomDescription,
      isOpen,
      vsipId,
      futureVisits,
    }: { prisonId: string; nomisRoomDescription: string; isOpen: boolean; vsipId: string; futureVisits: boolean } =
      req.body

    const errors = addRoomMappingValidator({ isOpen, vsipId, nomisRoomDescription })

    if (errors.length > 0) {
      res.render('pages/visits/addRoomMapping', { prisonId, nomisRoomDescription, vsipId, errors, futureVisits })
    } else {
      await this.mappingService.addVisitRoomMappings(prisonId, { isOpen, vsipId, nomisRoomDescription }, context(res))
      res.redirect(`/visits-room-mappings/?prisonId=${prisonId}&futureVisits=${futureVisits}`)
    }
  }
}
