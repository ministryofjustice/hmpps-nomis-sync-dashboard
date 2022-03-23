import { Request, Response } from 'express'
import VisitMigrationController from './visitMigrationController'
import { VisitMigrations } from '../../services/nomisMigrationService'
import nomisMigrationService from '../testutils/mockNomisMigrationService'
import nomisPrisonerService from '../testutils/mockNomisPrisonerService'

describe('visitMigrationController', () => {
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

  it('should decorate the returned migrations', async () => {
    const visitMigrationResponse: VisitMigrations = {
      migrations: [
        {
          migrationId: '2022-03-14T10:13:56',
          whenStarted: '2022-03-14T10:13:56.878627',
          whenEnded: '2022-03-14T10:14:07.531409',
          estimatedRecordCount: 0,
          filter:
            '{"prisonIds":["HEI"],"visitTypes":["SCON"],"fromDateTime":"2022-03-04T16:01:00","ignoreMissingRoom":false}',
          recordsMigrated: 0,
          recordsFailed: 0,
          migrationType: 'VISITS',
          status: 'COMPLETED',
          id: '2022-03-14T10:13:56',
        },
        {
          migrationId: '2022-03-14T11:45:12',
          whenStarted: '2022-03-14T11:45:12.615759',
          whenEnded: '2022-03-14T13:26:10.047061',
          estimatedRecordCount: 205630,
          filter: '{"prisonIds":["HEI"],"visitTypes":["SCON"],"ignoreMissingRoom":false}',
          recordsMigrated: 1,
          recordsFailed: 162794,
          migrationType: 'VISITS',
          status: 'COMPLETED',
          id: '2022-03-14T11:45:12',
        },
      ],
    }

    const decoratedMigrations = [
      {
        migrationId: '2022-03-14T10:13:56',
        whenStarted: '2022-03-14T10:13:56.878627',
        whenEnded: '2022-03-14T10:14:07.531409',
        estimatedRecordCount: 0,
        filter:
          '{"prisonIds":["HEI"],"visitTypes":["SCON"],"fromDateTime":"2022-03-04T16:01:00","ignoreMissingRoom":false}',
        recordsMigrated: 0,
        recordsFailed: 0,
        migrationType: 'VISITS',
        status: 'COMPLETED',
        id: '2022-03-14T10:13:56',
        filterPrisonIds: 'HEI',
        filterVisitTypes: 'SCON',
        filterFromDate: '2022-03-04T16:01:00',
      },
      {
        migrationId: '2022-03-14T11:45:12',
        whenStarted: '2022-03-14T11:45:12.615759',
        whenEnded: '2022-03-14T13:26:10.047061',
        estimatedRecordCount: 205630,
        filter: '{"prisonIds":["HEI"],"visitTypes":["SCON"],"ignoreMissingRoom":false}',
        recordsMigrated: 1,
        recordsFailed: 162794,
        migrationType: 'VISITS',
        status: 'COMPLETED',
        id: '2022-03-14T11:45:12',
        filterPrisonIds: 'HEI',
        filterVisitTypes: 'SCON',
      },
    ]
    nomisMigrationService.getVisitMigrations.mockResolvedValue(visitMigrationResponse)

    await new VisitMigrationController(nomisMigrationService, nomisPrisonerService).getVisitMigrations(req, res)
    expect(res.render).toBeCalled()
    expect(res.render).toBeCalledWith('pages/visits/visitsMigration', {
      migrations: expect.arrayContaining([
        expect.objectContaining(decoratedMigrations[0]),
        expect.objectContaining(decoratedMigrations[1]),
      ]),
    })
  })
})
