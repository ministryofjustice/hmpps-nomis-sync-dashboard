import { Request, Response } from 'express'
import { Context } from '../../services/nomisMigrationService'
import NomisPrisonerService from '../../services/nomisPrisonerService'
import MappingService from '../../services/mappingService'

function context(res: Response): Context {
  return {
    username: res?.locals?.user?.username,
    token: res?.locals?.user?.token,
  }
}

export default class RoomMappingController {
  constructor(
    private readonly mappingService: MappingService,
    private readonly nomisPrisonerService: NomisPrisonerService
  ) {}

  async getVisitRoomMappings(req: Request, res: Response): Promise<void> {
    const { prisonId } = req.query as { prisonId: string }
    await this.viewMappings(prisonId, res)
  }

  private async viewMappings(prisonId: string, res: Response) {
    const mappings = await this.mappingService.getVisitRoomMappings(prisonId, context(res))
    const nomisVisitRooms = await this.nomisPrisonerService.getVisitRooms(prisonId, context(res))

    const rooms = nomisVisitRooms.map(nomisRoom => ({
      ...nomisRoom,
      ...mappings.find(mapping => mapping.nomisRoomDescription === nomisRoom.agencyInternalLocationDescription),
    }))

    res.render('pages/visits/viewRoomMappings', {
      rooms,
      prisonId,
    })
  }

  getPrison(req: Request, res: Response): void {
    res.render('pages/visits/roomMappingPrison', {})
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  async addVisitRoomMapping(req: Request, res: Response) {
    // TODO
  }

  async deleteVisitRoomMapping(req: Request, res: Response) {
    const { prisonId, nomisRoomDescription }: { prisonId: string; nomisRoomDescription: string } = req.body
    await this.mappingService.deleteVisitRoomMappings(prisonId, nomisRoomDescription, context(res))
    await this.viewMappings(prisonId, res)
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  async postAddVisitRoomMapping(req: Request, res: Response) {
    // TODO
  }
}
