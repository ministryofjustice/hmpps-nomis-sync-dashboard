import { Request, Response } from 'express'
import mappingService from '../testutils/mockMappingService'
import nomisPrisonerService from '../testutils/mockNomisPrisonerService'
import RoomMappingController from './roomMappingController'
import { RoomMappingResponse } from '../../@types/mapping'
import { VisitRoomCountResponse } from '../../@types/nomisPrisoner'

describe('roomMappingController', () => {
  const req = {
    query: {},
    session: {},
    flash: jest.fn(),
  } as unknown as Request
  const res = {
    locals: {},
    render: jest.fn(),
    redirect: jest.fn(),
  } as unknown as Response

  beforeEach(() => {
    jest.resetAllMocks()
  })

  describe('getVisitRoomMappings', () => {
    it('should return mapping and usage information for given prison', async () => {
      req.query = { prisonId: 'HEI', futureVisits: 'true' }
      const nomisUsageResponse: VisitRoomCountResponse[] = [
        {
          agencyInternalLocationDescription: 'HEI-OPEN-1',
          count: 1,
          prisonId: 'HEI',
        },
        {
          agencyInternalLocationDescription: 'HEI-CLOSED-1',
          count: 37,
          prisonId: 'HEI',
        },
        {
          agencyInternalLocationDescription: 'HEI-OPEN-2',
          count: 1,
          prisonId: 'HEI',
        },
        {
          agencyInternalLocationDescription: 'HEI-CLOSED-2',
          count: 2,
          prisonId: 'HEI',
        },
        {
          agencyInternalLocationDescription: 'HEI-OPEN-3',
          count: 5,
          prisonId: 'HEI',
        },
      ]

      const mappingResponse: RoomMappingResponse[] = [
        {
          vsipId: 'Visits Main Room',
          nomisRoomDescription: 'HEI-OPEN-1',
          prisonId: 'HEI',
          isOpen: true,
        },
        {
          vsipId: 'Visits closed Room',
          nomisRoomDescription: 'HEI-CLOSED-2',
          prisonId: 'HEI',
          isOpen: false,
        },
      ]

      const decoratedResponse = [
        {
          agencyInternalLocationDescription: 'HEI-OPEN-1',
          nomisRoomDescription: 'HEI-OPEN-1',
          vsipId: 'Visits Main Room',
          count: 1,
          prisonId: 'HEI',
          isOpen: true,
        },
        {
          agencyInternalLocationDescription: 'HEI-CLOSED-1',
          count: 37,
          prisonId: 'HEI',
        },
        {
          agencyInternalLocationDescription: 'HEI-OPEN-2',
          count: 1,
          prisonId: 'HEI',
        },
        {
          agencyInternalLocationDescription: 'HEI-CLOSED-2',
          nomisRoomDescription: 'HEI-CLOSED-2',
          vsipId: 'Visits closed Room',
          count: 2,
          prisonId: 'HEI',
          isOpen: false,
        },
        {
          agencyInternalLocationDescription: 'HEI-OPEN-3',
          count: 5,
          prisonId: 'HEI',
        },
      ]

      nomisPrisonerService.getVisitRooms.mockResolvedValue(nomisUsageResponse)
      mappingService.getVisitRoomMappings.mockResolvedValue(mappingResponse)

      await new RoomMappingController(mappingService, nomisPrisonerService).getVisitRoomMappings(req, res)
      expect(nomisPrisonerService.getVisitRooms).toHaveBeenCalledWith('HEI', true, expect.anything())
      expect(res.render).toBeCalled()
      expect(res.render).toBeCalledWith('pages/visits/viewRoomMappings', {
        rooms: decoratedResponse,
        prisonId: 'HEI',
        futureVisits: true,
      })
    })
  })
})
