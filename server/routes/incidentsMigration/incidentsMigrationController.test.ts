import { Request, Response } from 'express'
import IncidentsMigrationController from './incidentsMigrationController'
import { HistoricMigrations } from '../../services/nomisMigrationService'
import nomisMigrationService from '../testutils/mockNomisMigrationService'
import nomisPrisonerService from '../testutils/mockNomisPrisonerService'

describe('incidentsMigrationController', () => {
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

  describe('getIncidentsMigrations', () => {
    it('should decorate the returned migrations', async () => {
      const incidentsMigrationResponse: HistoricMigrations = {
        migrations: [
          {
            migrationId: '2022-03-30T10:13:56',
            whenStarted: '2022-03-30T10:13:56.878627',
            whenEnded: '2022-03-30T10:14:07.531409',
            estimatedRecordCount: 0,
            filter: '{"fromDate":"2022-03-04"}',
            recordsMigrated: 0,
            recordsFailed: 0,
            migrationType: 'INCIDENTS',
            status: 'COMPLETED',
            id: '2022-03-14T10:13:56',
            isNew: false,
          },
          {
            migrationId: '2022-03-14T11:45:12',
            whenStarted: '2022-03-14T11:45:12.615759',
            whenEnded: '2022-03-14T13:26:10.047061',
            estimatedRecordCount: 205630,
            filter: '{}',
            recordsMigrated: 1,
            recordsFailed: 162794,
            migrationType: 'INCIDENTS',
            status: 'COMPLETED',
            id: '2022-03-14T11:45:12',
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
          filter: '{"fromDate":"2022-03-04"}',
          recordsMigrated: 0,
          recordsFailed: 0,
          migrationType: 'INCIDENTS',
          status: 'COMPLETED',
          id: '2022-03-14T10:13:56',
          applicationInsightsLink: expect.stringContaining(encodeURIComponent('2022-03-30T09:13:56.878Z')), // BST was 2022-03-30T10:13:56.878627
        },
        {
          migrationId: '2022-03-14T11:45:12',
          whenStarted: '2022-03-14T11:45:12.615759',
          whenEnded: '2022-03-14T13:26:10.047061',
          estimatedRecordCount: 205630,
          filter: '{}',
          recordsMigrated: 1,
          recordsFailed: 162794,
          migrationType: 'INCIDENTS',
          status: 'COMPLETED',
          id: '2022-03-14T11:45:12',
          applicationInsightsLink: expect.stringContaining(encodeURIComponent('2022-03-14T11:45:12.615Z')), // GMT was 2022-03-14T11:45:12.615759
        },
      ]
      nomisMigrationService.getIncidentsMigrations.mockResolvedValue(incidentsMigrationResponse)

      await new IncidentsMigrationController(nomisMigrationService, nomisPrisonerService).getIncidentsMigrations(
        req,
        res,
      )
      expect(res.render).toBeCalled()
      expect(res.render).toBeCalledWith('pages/incidents/incidentsMigration', {
        migrations: expect.arrayContaining([
          expect.objectContaining(decoratedMigrations[0]),
          expect.objectContaining(decoratedMigrations[1]),
        ]),
      })
    })
  })

  describe('viewFailures', () => {
    beforeEach(() => {
      nomisMigrationService.getIncidentsFailures.mockResolvedValue({
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
      await new IncidentsMigrationController(nomisMigrationService, nomisPrisonerService).viewFailures(req, res)
      expect(res.render).toBeCalledWith('pages/incidents/incidentsMigrationFailures', {
        failures: expect.objectContaining({
          messages: expect.arrayContaining([
            expect.objectContaining({
              applicationInsightsLink:
                "http://localhost:8103/applicationinsights/#blade/Microsoft_Azure_Monitoring_Logs/LogsBlade/resourceId/%2Fsubscriptions%2Fsubscription%2FresourceGroups%2Fcomponent-rg%2Fproviders%2FMicrosoft.Insights%2Fcomponents%2Fcomponent/source/LogsBlade.AnalyticsShareLinkToQuery/query/exceptions%0A%20%20%20%20%7C%20where%20cloud_RoleName%20%3D%3D%20'hmpps-prisoner-from-nomis-migration'%20%0A%20%20%20%20%7C%20where%20customDimensions.%5B%22Logger%20Message%22%5D%20%3D%3D%20%22MessageID%3Aafeb75fd-a2aa-41c4-9ede-b6bfe9590d36%22%0A%20%20%20%20%7C%20order%20by%20timestamp%20desc/timespan/P1D",
            }),
            expect.objectContaining({
              applicationInsightsLink:
                "http://localhost:8103/applicationinsights/#blade/Microsoft_Azure_Monitoring_Logs/LogsBlade/resourceId/%2Fsubscriptions%2Fsubscription%2FresourceGroups%2Fcomponent-rg%2Fproviders%2FMicrosoft.Insights%2Fcomponents%2Fcomponent/source/LogsBlade.AnalyticsShareLinkToQuery/query/exceptions%0A%20%20%20%20%7C%20where%20cloud_RoleName%20%3D%3D%20'hmpps-prisoner-from-nomis-migration'%20%0A%20%20%20%20%7C%20where%20customDimensions.%5B%22Logger%20Message%22%5D%20%3D%3D%20%22MessageID%3A86b96f0e-2ac3-445c-b3ac-0a4d525d371e%22%0A%20%20%20%20%7C%20order%20by%20timestamp%20desc/timespan/P1D",
            }),
          ]),
        }),
      })
    })
  })

  describe('postStartIncidentsMigration', () => {
    describe('with validation error', () => {
      it('should return an error response', async () => {
        req.body = {
          _csrf: 'ArcKbKvR-OU86UdNwW8RgAGJjIQ9N081rlgM',
          action: 'startMigration',
          toDate: 'banana',
        }
        await new IncidentsMigrationController(nomisMigrationService, nomisPrisonerService).postStartIncidentsMigration(
          req,
          res,
        )
        expect(req.flash).toBeCalledWith('errors', [{ href: '#toDate', text: 'Enter a real date, like 2020-03-23' }])
        expect(res.redirect).toHaveBeenCalledWith('/incidents-migration/amend')
      })
    })
  })
})
