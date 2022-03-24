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

  describe('getVisitMigrations', () => {
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

  describe('postStartVisitMigration', () => {
    describe('with validation error', () => {
      it('should return an error response', async () => {
        req.body = {
          _csrf: 'ArcKbKvR-OU86UdNwW8RgAGJjIQ9N081rlgM',
          action: 'viewEstimatedCount',
        }
        await new VisitMigrationController(nomisMigrationService, nomisPrisonerService).postStartVisitMigration(
          req,
          res
        )
        expect(req.flash).toBeCalledWith('errors', [
          { href: '#prisonIds', text: 'Enter one or more prison IDs' },
          { href: '#visitTypes', text: 'Enter the type of visits to migrate' },
        ])
        expect(res.redirect).toHaveBeenCalledWith('/visits-migration/start')
      })
    })
    describe('when estimate requested', () => {
      beforeEach(() => {
        req.body = {
          _csrf: 'ArcKbKvR-OU86UdNwW8RgAGJjIQ9N081rlgM',
          action: 'viewEstimatedCount',
          prisonIds: 'HEI',
          visitTypes: 'SCON',
        }
        nomisPrisonerService.getVisitMigrationEstimatedCount.mockResolvedValue(124_001)
      })
      it('should render the start page again', async () => {
        await new VisitMigrationController(nomisMigrationService, nomisPrisonerService).postStartVisitMigration(
          req,
          res
        )
        expect(res.redirect).toHaveBeenCalledWith('/visits-migration/start')
      })
    })
    describe('when new migration requested', () => {
      beforeEach(() => {
        req.body = {
          _csrf: 'ArcKbKvR-OU86UdNwW8RgAGJjIQ9N081rlgM',
          action: 'startMigration',
          prisonIds: 'HEI, MDI',
          fromDateTime: '2020-03-23T12:00:00',
          toDateTime: '2020-03-24',
          visitTypes: 'SCON',
        }
        nomisMigrationService.startVisitsMigration.mockResolvedValue({
          migrationId: '2022-03-14T10:13:56',
          estimatedCount: 124_001,
          body: {
            prisonIds: ['HEI'],
            visitTypes: ['SCON'],
            fromDateTime: '2020-03-23T12:00:00',
            toDateTime: '2020-03-24T00:00:00',
            ignoreMissingRoom: false,
          },
        })
      })

      it('should render the confirmation page', async () => {
        await new VisitMigrationController(nomisMigrationService, nomisPrisonerService).postStartVisitMigration(
          req,
          res
        )
        expect(res.redirect).toHaveBeenCalledWith('/visits-migration/start/confirmation')
      })
      it('should call start migration service', async () => {
        await new VisitMigrationController(nomisMigrationService, nomisPrisonerService).postStartVisitMigration(
          req,
          res
        )
        expect(nomisMigrationService.startVisitsMigration).toBeCalled()
      })
      it('should convert prison ids to array', async () => {
        await new VisitMigrationController(nomisMigrationService, nomisPrisonerService).postStartVisitMigration(
          req,
          res
        )
        expect(nomisMigrationService.startVisitsMigration).toBeCalledWith(
          expect.objectContaining({ prisonIds: ['HEI', 'MDI'] }),
          expect.anything()
        )
      })
      it('should convert single visit type to array', async () => {
        await new VisitMigrationController(nomisMigrationService, nomisPrisonerService).postStartVisitMigration(
          req,
          res
        )
        expect(nomisMigrationService.startVisitsMigration).toBeCalledWith(
          expect.objectContaining({ visitTypes: ['SCON'] }),
          expect.anything()
        )
      })
      it('should pass fromDateTime to service', async () => {
        await new VisitMigrationController(nomisMigrationService, nomisPrisonerService).postStartVisitMigration(
          req,
          res
        )
        expect(nomisMigrationService.startVisitsMigration).toBeCalledWith(
          expect.objectContaining({ fromDateTime: '2020-03-23T12:00:00' }),
          expect.anything()
        )
      })
      it('should add midnight to date when not present', async () => {
        await new VisitMigrationController(nomisMigrationService, nomisPrisonerService).postStartVisitMigration(
          req,
          res
        )
        expect(nomisMigrationService.startVisitsMigration).toBeCalledWith(
          expect.objectContaining({ toDateTime: '2020-03-24T00:00:00' }),
          expect.anything()
        )
      })
    })
  })
})
