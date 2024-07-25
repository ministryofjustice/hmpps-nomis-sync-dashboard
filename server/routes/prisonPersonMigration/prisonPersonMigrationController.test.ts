import { Request, Response } from 'express'
import { HistoricMigrations } from '../../services/nomisMigrationService'
import nomisMigrationService from '../testutils/mockNomisMigrationService'
import PrisonPersonMigrationController from './prisonPersonMigrationController'

describe('prisonPersonMigrationController', () => {
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

  describe('getPrisonPersonMigrations', () => {
    it('should decorate the returned migrations', async () => {
      const prisonPersonMigrationResponse: HistoricMigrations = {
        migrations: [
          {
            migrationId: '2022-03-30T10:13:56',
            whenStarted: '2022-03-30T10:13:56.878627',
            whenEnded: '2022-03-30T10:14:07.531409',
            estimatedRecordCount: 0,
            filter: '{"prisonerNumber": "A1234BC"}',
            recordsMigrated: 0,
            recordsFailed: 0,
            migrationType: 'PRISONPERSON',
            status: 'COMPLETED',
            id: '2022-03-14T10:13:56',
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
          filter: '{"prisonerNumber": "A1234BC"}',
          recordsMigrated: 0,
          recordsFailed: 0,
          migrationType: 'PRISONPERSON',
          status: 'COMPLETED',
          id: '2022-03-14T10:13:56',
          isNew: false,
          applicationInsightsLink: expect.stringContaining(encodeURIComponent('2022-03-30T09:13:56.878Z')), // BST was 2022-03-30T10:13:56.878627
        },
      ]
      nomisMigrationService.getPrisonPersonMigrations.mockResolvedValue(prisonPersonMigrationResponse)

      await new PrisonPersonMigrationController(nomisMigrationService).getPrisonPersonMigrations(req, res)
      expect(res.render).toBeCalled()
      expect(res.render).toBeCalledWith('pages/prisonperson/prisonPersonMigration', {
        migrations: expect.arrayContaining([expect.objectContaining(decoratedMigrations[0])]),
        errors: expect.arrayContaining([]),
      })
    })
  })
})
