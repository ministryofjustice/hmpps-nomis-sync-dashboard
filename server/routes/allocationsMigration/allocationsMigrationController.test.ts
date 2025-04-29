import { Request, Response } from 'express'
import AllocationsMigrationController from './allocationsMigrationController'
import { HistoricMigrations } from '../../data/nomisMigrationClient'
import allocationsNomisMigrationService from '../testutils/mockAllocationsNomisMigrationService'
import nomisMigrationService from '../testutils/mockNomisMigrationService'
import nomisPrisonerService from '../testutils/mockNomisPrisonerService'

describe('allocationsMigrationController', () => {
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

  describe('getAllocationsMigrations', () => {
    it('should decorate the returned migrations', async () => {
      const allocationsMigrationResponse: HistoricMigrations = {
        migrations: [
          {
            migrationId: '2022-03-30T10:13:56',
            whenStarted: '2022-03-30T10:13:56.878627',
            whenEnded: '2022-03-30T10:14:07.531409',
            estimatedRecordCount: 0,
            filter: '{"prisonId": "MDI"}',
            recordsMigrated: 0,
            recordsFailed: 0,
            migrationType: 'ALLOCATIONS',
            status: 'COMPLETED',
            id: '2022-03-14T10:13:56',
            isNew: false,
          },
          {
            migrationId: '2022-03-14T11:45:12',
            whenStarted: '2022-03-14T11:45:12.615759',
            whenEnded: '2022-03-14T13:26:10.047061',
            estimatedRecordCount: 205630,
            filter: '{"prisonIds": "MDI", "courseActivityId": 12345}',
            recordsMigrated: 1,
            recordsFailed: 162794,
            migrationType: 'ALLOCATIONS',
            status: 'COMPLETED',
            id: '2022-03-14T11:45:12',
            isNew: false,
          },
          {
            migrationId: '2022-03-11T11:45:12',
            whenStarted: '2022-03-11T11:45:12.615759',
            whenEnded: '2022-03-11T13:26:10.047061',
            estimatedRecordCount: 1,
            filter: '{"prisonIds": "MDI", "courseActivityId": 12345}',
            recordsMigrated: 0,
            recordsFailed: 0,
            migrationType: 'ALLOCATIONS',
            status: 'COMPLETED',
            id: '2022-03-11T11:45:12',
            isNew: false,
          },
        ],
      }

      const decoratedMigrations = [
        {
          migrationId: '2022-03-30T10:13:56',
          whenStarted: '2022-03-30T10:13:56.878627',
          whenEnded: '2022-03-30T10:14:07.531409',
          estimatedRecordCount: 0,
          filter: '{"prisonId": "MDI"}',
          recordsMigrated: 0,
          recordsFailed: 0,
          migrationType: 'ALLOCATIONS',
          status: 'COMPLETED',
          id: '2022-03-14T10:13:56',
          isNew: false,
          appInsightsFullMigrationLink: expect.stringContaining(encodeURIComponent('2022-03-30T09:13:56.878Z')), // BST was 2022-03-30T10:13:56.878627
        },
        {
          migrationId: '2022-03-14T11:45:12',
          whenStarted: '2022-03-14T11:45:12.615759',
          whenEnded: '2022-03-14T13:26:10.047061',
          estimatedRecordCount: 205630,
          filter: '{"prisonIds": "MDI", "courseActivityId": 12345}',
          recordsMigrated: 1,
          recordsFailed: 162794,
          migrationType: 'ALLOCATIONS',
          status: 'COMPLETED',
          id: '2022-03-14T11:45:12',
          isNew: false,
          appInsightsFullMigrationLink: expect.stringContaining(encodeURIComponent('2022-03-14T11:45:12.615Z')), // GMT was 2022-03-14T11:45:12.615759
          appInsightsFailuresLink: expect.stringContaining(encodeURIComponent('2022-03-14T11:45:12.615Z')), // GMT was 2022-03-14T11:45:12.615759
        },
        {
          migrationId: '2022-03-11T11:45:12',
          whenStarted: '2022-03-11T11:45:12.615759',
          whenEnded: '2022-03-11T13:26:10.047061',
          estimatedRecordCount: 1,
          filter: '{"prisonIds": "MDI", "courseActivityId": 12345}',
          recordsMigrated: 0,
          recordsFailed: 0,
          migrationType: 'ALLOCATIONS',
          status: 'COMPLETED',
          id: '2022-03-11T11:45:12',
          isNew: false,
          appInsightsFullMigrationLink: expect.stringContaining(encodeURIComponent('2022-03-14T11:45:12.615Z')), // GMT was 2022-03-11T11:45:12.615759
          appInsightsAlreadyMigratedLink: expect.stringContaining(encodeURIComponent('2022-03-14T11:45:12.615Z')), // GMT was 2022-03-11T11:45:12.615759
        },
      ]
      nomisMigrationService.getMigrationHistory.mockResolvedValue(allocationsMigrationResponse)

      await new AllocationsMigrationController(
        allocationsNomisMigrationService,
        nomisMigrationService,
        nomisPrisonerService,
      ).getAllocationsMigrations(req, res)
      expect(res.render).toHaveBeenCalled()
      expect(res.render).toHaveBeenCalledWith('pages/allocations/allocationsMigration', {
        migrations: expect.arrayContaining([
          expect.objectContaining(decoratedMigrations[0]),
          expect.objectContaining(decoratedMigrations[1]),
        ]),
        errors: expect.arrayContaining([]),
      })
    })
  })

  describe('postStartAllocationsMigration', () => {
    describe('with validation error', () => {
      it('should return an error response', async () => {
        req.body = {
          _csrf: 'ArcKbKvR-OU86UdNwW8RgAGJjIQ9N081rlgM',
          action: 'startMigration',
        }
        await new AllocationsMigrationController(
          allocationsNomisMigrationService,
          nomisMigrationService,
          nomisPrisonerService,
        ).postStartAllocationsMigration(req, res)
        expect(req.flash).toHaveBeenCalledWith('errors', [{ href: '#prisonId', text: 'Enter a prison ID.' }])
        expect(res.redirect).toHaveBeenCalledWith('/allocations-migration/amend')
      })
    })
  })
})
