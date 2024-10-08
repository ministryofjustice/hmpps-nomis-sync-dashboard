import { Request, Response } from 'express'
import { HistoricMigrations } from '../../services/nomisMigrationService'
import nomisMigrationService from '../testutils/mockNomisMigrationService'
import PrisonPersonMigrationController from './prisonPersonMigrationController'
import nomisPrisonerService from '../testutils/mockNomisPrisonerService'

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
            filter: '{"prisonerNumber": "A1234BC", "migrationType": "PHYSICAL_ATTRIBUTES"}',
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
          filter: '{"prisonerNumber": "A1234BC", "migrationType": "PHYSICAL_ATTRIBUTES"}',
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

      await new PrisonPersonMigrationController(nomisMigrationService, nomisPrisonerService).getPrisonPersonMigrations(
        req,
        res,
      )
      expect(res.render).toBeCalled()
      expect(res.render).toBeCalledWith('pages/prisonperson/prisonPersonMigration', {
        migrations: expect.arrayContaining([expect.objectContaining(decoratedMigrations[0])]),
        errors: expect.arrayContaining([]),
      })
    })
  })

  describe('viewFailures', () => {
    beforeEach(() => {
      nomisMigrationService.getPrisonPersonFailures.mockResolvedValue({
        messagesFoundCount: 353,
        messagesReturnedCount: 5,
        messages: [
          {
            body: {},
            messageId: 'afeb75fd-a2aa-41c4-9ede-b6bfe9590d36',
          },
          {
            body: {},
            messageId: '86b96f0e-2ac3-445c-b3ac-0a4d525d371e',
          },
        ],
      })
    })
    it('should render the failures page with application insights link for failed messageId', async () => {
      await new PrisonPersonMigrationController(nomisMigrationService, nomisPrisonerService).viewFailures(req, res)
      expect(res.render).toBeCalledWith('pages/prisonperson/prisonPersonMigrationFailures', {
        failures: expect.objectContaining({
          messages: expect.arrayContaining([
            expect.objectContaining({
              applicationInsightsLink:
                "http://localhost:8103/applicationinsights/resourceId/%2Fsubscriptions%2Fsubscription%2FresourceGroups%2Fcomponent-rg%2Fproviders%2FMicrosoft.Insights%2Fcomponents%2Fcomponent/source/LogsBlade.AnalyticsShareLinkToQuery/query/exceptions%0A%20%20%20%20%7C%20where%20cloud_RoleName%20%3D%3D%20'hmpps-prisoner-from-nomis-migration'%20%0A%20%20%20%20%7C%20where%20customDimensions.%5B%22Logger%20Message%22%5D%20%3D%3D%20%22MessageID%3Aafeb75fd-a2aa-41c4-9ede-b6bfe9590d36%22%0A%20%20%20%20%7C%20order%20by%20timestamp%20desc/timespan/P1D",
            }),
            expect.objectContaining({
              applicationInsightsLink:
                "http://localhost:8103/applicationinsights/resourceId/%2Fsubscriptions%2Fsubscription%2FresourceGroups%2Fcomponent-rg%2Fproviders%2FMicrosoft.Insights%2Fcomponents%2Fcomponent/source/LogsBlade.AnalyticsShareLinkToQuery/query/exceptions%0A%20%20%20%20%7C%20where%20cloud_RoleName%20%3D%3D%20'hmpps-prisoner-from-nomis-migration'%20%0A%20%20%20%20%7C%20where%20customDimensions.%5B%22Logger%20Message%22%5D%20%3D%3D%20%22MessageID%3A86b96f0e-2ac3-445c-b3ac-0a4d525d371e%22%0A%20%20%20%20%7C%20order%20by%20timestamp%20desc/timespan/P1D",
            }),
          ]),
        }),
      })
    })
  })
})
