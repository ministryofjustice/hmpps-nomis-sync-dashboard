import { Request, Response } from 'express'
import moment from 'moment'
import VisitsMigrationController from './visitsMigrationController'
import { HistoricMigrations, HistoricMigrationDetails } from '../../services/nomisMigrationService'
import nomisMigrationService from '../testutils/mockNomisMigrationService'
import nomisPrisonerService from '../testutils/mockNomisPrisonerService'

describe('visitsMigrationController', () => {
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
      const visitMigrationResponse: HistoricMigrations = {
        migrations: [
          {
            migrationId: '2022-03-30T10:13:56',
            whenStarted: '2022-03-30T10:13:56.878627',
            whenEnded: '2022-03-30T10:14:07.531409',
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
          migrationId: '2022-03-30T10:13:56',
          whenStarted: '2022-03-30T10:13:56.878627',
          whenEnded: '2022-03-30T10:14:07.531409',
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
          applicationInsightsLink: expect.stringContaining(encodeURIComponent('2022-03-30T09:13:56.878Z')), // BST was 2022-03-30T10:13:56.878627
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
          applicationInsightsLink: expect.stringContaining(encodeURIComponent('2022-03-14T11:45:12.615Z')), // GMT was 2022-03-14T11:45:12.615759
        },
      ]
      nomisMigrationService.getVisitsMigrations.mockResolvedValue(visitMigrationResponse)

      await new VisitsMigrationController(nomisMigrationService, nomisPrisonerService).getVisitMigrations(req, res)
      expect(res.render).toBeCalled()
      expect(res.render).toBeCalledWith('pages/visits/visitsMigration', {
        migrations: expect.arrayContaining([
          expect.objectContaining(decoratedMigrations[0]),
          expect.objectContaining(decoratedMigrations[1]),
        ]),
        migrationViewFilter: expect.objectContaining({
          fromDateTime: undefined,
          includeOnlyFailures: false,
          prisonId: undefined,
          toDateTime: undefined,
        }),
        errors: expect.arrayContaining([]),
      })
    })

    it('should return an error response on invalid date', async () => {
      req.query.toDateTime = 'invalid'
      req.query.fromDateTime = '23/4'
      await new VisitsMigrationController(nomisMigrationService, nomisPrisonerService).getVisitMigrations(req, res)
      expect(res.render).toBeCalled()
      expect(res.render).toBeCalledWith('pages/visits/visitsMigration', {
        migrationViewFilter: expect.objectContaining({
          fromDateTime: '23/4',
          includeOnlyFailures: false,
          prisonId: undefined,
          toDateTime: 'invalid',
        }),
        errors: expect.arrayContaining([
          expect.objectContaining({
            href: '#toDateTime',
            text: 'Enter a real date time, like 2020-03-23T12:00:00 or 2020-03-23',
          }),
          expect.objectContaining({
            href: '#fromDateTime',
            text: 'Enter a real date time, like 2020-03-23T12:00:00 or 2020-03-23',
          }),
        ]),
      })
    })
  })

  describe('startVisitMigration', () => {
    it('should clear any previous form data from the session for new migration', async () => {
      req.session.startVisitsMigrationForm = {
        prisonIds: 'HEI, MDI',
        fromDateTime: '2020-03-23T12:00:00',
        toDateTime: '2020-03-24',
        visitTypes: 'SCON',
      }
      await new VisitsMigrationController(nomisMigrationService, nomisPrisonerService).startNewVisitMigration(req, res)
      expect(res.render).toBeCalledWith('pages/visits/startVisitsMigration', {
        form: undefined,
        errors: undefined,
      })
    })

    it('should maintain form data from the session for amending a migration', async () => {
      req.session.startVisitsMigrationForm = {
        prisonIds: 'HEI, MDI',
        fromDateTime: '2020-03-23T12:00:00',
        toDateTime: '2020-03-24',
        visitTypes: 'SCON',
      }
      await new VisitsMigrationController(nomisMigrationService, nomisPrisonerService).startVisitMigration(req, res)
      expect(res.render).toBeCalledWith('pages/visits/startVisitsMigration', {
        form: expect.objectContaining({
          fromDateTime: '2020-03-23T12:00:00',
          prisonIds: 'HEI, MDI',
          toDateTime: '2020-03-24',
          visitTypes: 'SCON',
        }),
        errors: undefined,
      })
    })
  })

  describe('postStartVisitMigration', () => {
    describe('with validation error', () => {
      it('should return an error response', async () => {
        req.body = {
          _csrf: 'ArcKbKvR-OU86UdNwW8RgAGJjIQ9N081rlgM',
          action: 'startMigration',
        }
        await new VisitsMigrationController(nomisMigrationService, nomisPrisonerService).postStartVisitMigration(
          req,
          res
        )
        expect(req.flash).toBeCalledWith('errors', [
          { href: '#prisonIds', text: 'Enter one or more prison IDs' },
          { href: '#visitTypes', text: 'Enter the type of visits to migrate' },
        ])
        expect(res.redirect).toHaveBeenCalledWith('/visits-migration/amend')
      })
    })
    describe('when migration preview is requested', () => {
      beforeEach(() => {
        req.body = {
          _csrf: 'ArcKbKvR-OU86UdNwW8RgAGJjIQ9N081rlgM',
          action: 'startMigration',
          prisonIds: 'HEI',
          visitTypes: 'SCON',
        }
        nomisPrisonerService.getVisitMigrationEstimatedCount.mockResolvedValue(124_001)
        nomisMigrationService.getVisitMigrationRoomMappings.mockResolvedValue([])
        nomisMigrationService.getVisitsDLQMessageCount.mockResolvedValue('4')
      })
      it('should render the migration preview page', async () => {
        await new VisitsMigrationController(nomisMigrationService, nomisPrisonerService).postStartVisitMigration(
          req,
          res
        )
        expect(res.redirect).toHaveBeenCalledWith('/visits-migration/start/preview')
      })
    })
    describe('when preview is submitted and new migration requested', () => {
      beforeEach(() => {
        req.body = {
          _csrf: 'ArcKbKvR-OU86UdNwW8RgAGJjIQ9N081rlgM',
          action: 'startMigration',
        }
        req.session.startVisitsMigrationForm = {
          prisonIds: 'HEI, MDI',
          fromDateTime: '2020-03-23T12:00:00',
          toDateTime: '2020-03-24',
          visitTypes: 'SCON',
        }
        nomisMigrationService.startVisitsMigration.mockResolvedValue({
          migrationId: '2022-03-14T10:13:56',
          estimatedCount: 124_001,
          type: 'VISITS',
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
        await new VisitsMigrationController(nomisMigrationService, nomisPrisonerService).postStartVisitMigrationPreview(
          req,
          res
        )
        expect(res.redirect).toHaveBeenCalledWith('/visits-migration/start/confirmation')
      })
      it('should call start migration service', async () => {
        await new VisitsMigrationController(nomisMigrationService, nomisPrisonerService).postStartVisitMigrationPreview(
          req,
          res
        )
        expect(nomisMigrationService.startVisitsMigration).toBeCalled()
      })
      it('should convert prison ids to array', async () => {
        await new VisitsMigrationController(nomisMigrationService, nomisPrisonerService).postStartVisitMigrationPreview(
          req,
          res
        )
        expect(nomisMigrationService.startVisitsMigration).toBeCalledWith(
          expect.objectContaining({ prisonIds: ['HEI', 'MDI'] }),
          expect.anything()
        )
      })
      it('should convert single visit type to array', async () => {
        await new VisitsMigrationController(nomisMigrationService, nomisPrisonerService).postStartVisitMigrationPreview(
          req,
          res
        )
        expect(nomisMigrationService.startVisitsMigration).toBeCalledWith(
          expect.objectContaining({ visitTypes: ['SCON'] }),
          expect.anything()
        )
      })
      it('should pass fromDateTime to service', async () => {
        await new VisitsMigrationController(nomisMigrationService, nomisPrisonerService).postStartVisitMigrationPreview(
          req,
          res
        )
        expect(nomisMigrationService.startVisitsMigration).toBeCalledWith(
          expect.objectContaining({ fromDateTime: '2020-03-23T12:00:00' }),
          expect.anything()
        )
      })
      it('should add midnight to date when not present', async () => {
        await new VisitsMigrationController(nomisMigrationService, nomisPrisonerService).postStartVisitMigrationPreview(
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

  describe('viewFailures', () => {
    beforeEach(() => {
      nomisMigrationService.getVisitsFailures.mockResolvedValue({
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
      await new VisitsMigrationController(nomisMigrationService, nomisPrisonerService).viewFailures(req, res)
      expect(res.render).toBeCalledWith('pages/visits/visitsMigrationFailures', {
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

  describe('cancelMigration', () => {
    beforeEach(() => {
      req.body = {
        _csrf: 'ArcKbKvR-OU86UdNwW8RgAGJjIQ9N081rlgM',
        migrationId: '2022-03-23T11:11:56',
      }
      nomisMigrationService.cancelVisitsMigration.mockResolvedValue()
      const visitMigrationResponse: HistoricMigrationDetails = {
        history: {
          migrationId: '2022-03-30T10:13:56',
          whenStarted: '2022-03-30T10:13:56.878627',
          whenEnded: '2022-03-30T10:14:07.531409',
          estimatedRecordCount: 0,
          filter:
            '{"prisonIds":["HEI"],"visitTypes":["SCON"],"fromDateTime":"2022-03-04T16:01:00","ignoreMissingRoom":false}',
          recordsMigrated: 0,
          recordsFailed: 0,
          migrationType: 'VISITS',
          status: 'COMPLETED',
          id: '2022-03-14T10:13:56',
        },
        currentProgress: {
          recordsFailed: '0',
          recordsToBeProcessed: '0',
          recordsMigrated: 0,
        },
      }

      nomisMigrationService.getVisitsMigration.mockResolvedValue(visitMigrationResponse)
    })

    it('should cancel migration and get latest status', async () => {
      await new VisitsMigrationController(nomisMigrationService, nomisPrisonerService).cancelMigration(req, res)
      expect(res.render).toBeCalled()
      expect(res.render).toBeCalledWith(
        'pages/visits/visitsMigrationDetails',
        expect.objectContaining({
          migration: expect.objectContaining({
            history: expect.objectContaining({
              id: '2022-03-14T10:13:56',
            }),
          }),
        })
      )
      expect(nomisMigrationService.cancelVisitsMigration).toBeCalledWith('2022-03-23T11:11:56', expect.anything())
      expect(nomisMigrationService.getVisitsMigration).toBeCalledWith('2022-03-23T11:11:56', expect.anything())
    })
  })
})
