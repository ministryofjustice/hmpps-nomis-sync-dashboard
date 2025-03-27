import { Request, Response } from 'express'
import AppointmentsMigrationController from './appointmentsMigrationController'
import { HistoricMigrations } from '../../services/nomisMigrationService'
import appointmentsNomisMigrationService from '../testutils/mockAppointmentsNomisMigrationService'
import nomisMigrationService from '../testutils/mockNomisMigrationService'
import nomisPrisonerService from '../testutils/mockNomisPrisonerService'

describe('appointmentsMigrationController', () => {
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

  describe('getAppointmentsMigrations', () => {
    it('should decorate the returned migrations', async () => {
      const appointmentsMigrationResponse: HistoricMigrations = {
        migrations: [
          {
            migrationId: '2022-03-30T10:13:56',
            whenStarted: '2022-03-30T10:13:56.878627',
            whenEnded: '2022-03-30T10:14:07.531409',
            estimatedRecordCount: 0,
            filter: '{"fromDate":"2022-03-04", "prisonIds": ["MDI"]}',
            recordsMigrated: 0,
            recordsFailed: 0,
            migrationType: 'APPOINTMENTS',
            status: 'COMPLETED',
            id: '2022-03-14T10:13:56',
            isNew: false,
          },
          {
            migrationId: '2022-03-14T11:45:12',
            whenStarted: '2022-03-14T11:45:12.615759',
            whenEnded: '2022-03-14T13:26:10.047061',
            estimatedRecordCount: 205630,
            filter: '{"prisonIds": ["MDI"]}',
            recordsMigrated: 1,
            recordsFailed: 162794,
            migrationType: 'APPOINTMENTS',
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
          filter: '{"fromDate":"2022-03-04", "prisonIds": ["MDI"]}',
          recordsMigrated: 0,
          recordsFailed: 0,
          migrationType: 'APPOINTMENTS',
          status: 'COMPLETED',
          id: '2022-03-14T10:13:56',
          isNew: false,
          applicationInsightsLink: expect.stringContaining(encodeURIComponent('2022-03-30T09:13:56.878Z')), // BST was 2022-03-30T10:13:56.878627
        },
        {
          migrationId: '2022-03-14T11:45:12',
          whenStarted: '2022-03-14T11:45:12.615759',
          whenEnded: '2022-03-14T13:26:10.047061',
          estimatedRecordCount: 205630,
          filter: '{"prisonIds": ["MDI"]}',
          recordsMigrated: 1,
          recordsFailed: 162794,
          migrationType: 'APPOINTMENTS',
          status: 'COMPLETED',
          id: '2022-03-14T11:45:12',
          isNew: false,
          applicationInsightsLink: expect.stringContaining(encodeURIComponent('2022-03-14T11:45:12.615Z')), // GMT was 2022-03-14T11:45:12.615759
        },
      ]
      nomisMigrationService.getMigrationHistory.mockResolvedValue(appointmentsMigrationResponse)

      await new AppointmentsMigrationController(
        appointmentsNomisMigrationService,
        nomisMigrationService,
        nomisPrisonerService,
      ).getAppointmentsMigrations(req, res)
      expect(res.render).toBeCalled()
      expect(res.render).toBeCalledWith('pages/appointments/appointmentsMigration', {
        migrations: expect.arrayContaining([
          expect.objectContaining(decoratedMigrations[0]),
          expect.objectContaining(decoratedMigrations[1]),
        ]),
        errors: expect.arrayContaining([]),
      })
    })
  })

  describe('viewFailures', () => {
    beforeEach(() => {
      nomisMigrationService.getFailures.mockResolvedValue({
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
      await new AppointmentsMigrationController(
        appointmentsNomisMigrationService,
        nomisMigrationService,
        nomisPrisonerService,
      ).viewFailures(req, res)
      expect(res.render).toBeCalledWith('pages/appointments/appointmentsMigrationFailures', {
        failures: expect.objectContaining({
          messages: expect.arrayContaining([
            expect.objectContaining({
              applicationInsightsLink:
                "http://localhost:8103/applicationinsights/#blade/Microsoft_Azure_Monitoring_Logs/LogsBlade/resourceId/%2Fsubscriptions%2Fsubscription%2FresourceGroups%2Fcomponent-rg%2Fproviders%2FMicrosoft.Insights%2Fcomponents%2Fcomponent/source/LogsBlade.AnalyticsShareLinkToQuery/query/exceptions%0A%20%20%20%20%7C%20where%20cloud_RoleName%20%3D%3D%20'hmpps-prisoner-from-nomis-migration'%0A%20%20%20%20%7C%20where%20customDimensions.%5B%22Logger%20Message%22%5D%20%3D%3D%20%22MessageID%3Aafeb75fd-a2aa-41c4-9ede-b6bfe9590d36%22%0A%20%20%20%20%7C%20order%20by%20timestamp%20desc/timespan/P1D",
            }),
            expect.objectContaining({
              applicationInsightsLink:
                "http://localhost:8103/applicationinsights/#blade/Microsoft_Azure_Monitoring_Logs/LogsBlade/resourceId/%2Fsubscriptions%2Fsubscription%2FresourceGroups%2Fcomponent-rg%2Fproviders%2FMicrosoft.Insights%2Fcomponents%2Fcomponent/source/LogsBlade.AnalyticsShareLinkToQuery/query/exceptions%0A%20%20%20%20%7C%20where%20cloud_RoleName%20%3D%3D%20'hmpps-prisoner-from-nomis-migration'%0A%20%20%20%20%7C%20where%20customDimensions.%5B%22Logger%20Message%22%5D%20%3D%3D%20%22MessageID%3A86b96f0e-2ac3-445c-b3ac-0a4d525d371e%22%0A%20%20%20%20%7C%20order%20by%20timestamp%20desc/timespan/P1D",
            }),
          ]),
        }),
      })
    })
  })

  describe('postStartAppointmentsMigration', () => {
    beforeEach(() => {
      nomisPrisonerService.getAppointmentsMigrationEstimatedCount.mockResolvedValue(10)
      nomisMigrationService.getFailureCount.mockResolvedValue('20')
      nomisPrisonerService.checkServiceAgencySwitch.mockResolvedValue(true)
      nomisPrisonerService.findAppointmentCounts.mockResolvedValue([])
    })

    describe('with validation error', () => {
      it('should return an error response', async () => {
        req.body = {
          _csrf: 'ArcKbKvR-OU86UdNwW8RgAGJjIQ9N081rlgM',
          action: 'startMigration',
          toDate: 'banana',
          prisonIds: 'MDI',
        }
        await new AppointmentsMigrationController(
          appointmentsNomisMigrationService,
          nomisMigrationService,
          nomisPrisonerService,
        ).postStartAppointmentsMigration(req, res)
        expect(req.flash).toBeCalledWith('errors', [{ href: '#toDate', text: 'Enter a real date, like 2020-03-23' }])
        expect(res.redirect).toHaveBeenCalledWith('/appointments-migration/amend')
      })
    })

    describe('with preview check errors', () => {
      it('should show errors from get NOMIS feature switch', async () => {
        nomisPrisonerService.checkServiceAgencySwitch.mockRejectedValue({
          data: {
            status: 503,
            userMessage: 'Service unavailable',
          },
        })
        nomisPrisonerService.findAppointmentCounts.mockRejectedValue({
          data: {
            status: 400,
            userMessage: 'Invalid from date: 2023-02-31',
          },
        })
        req.body = {
          _csrf: 'ArcKbKvR-OU86UdNwW8RgAGJjIQ9N081rlgM',
          action: 'startMigration',
          prisonIds: 'XXX,YYY',
        }

        await new AppointmentsMigrationController(
          appointmentsNomisMigrationService,
          nomisMigrationService,
          nomisPrisonerService,
        ).postStartAppointmentsMigration(req, res)

        expect(req.flash).toBeCalledWith('errors', [
          { href: '', text: 'Failed to check if APPOINTMENTS feature switch turned on for XXX: Service unavailable' },
          { href: '', text: 'Failed to check if APPOINTMENTS feature switch turned on for YYY: Service unavailable' },
          { href: '', text: 'Failed to find appointment summary counts due to error: Invalid from date: 2023-02-31' },
        ])
        expect(res.redirect).toHaveBeenCalledWith('/appointments-migration/start/preview')
      })
    })

    describe('with no errors', () => {
      it('should show NOMIS feature switch warning', async () => {
        nomisPrisonerService.checkServiceAgencySwitch.mockResolvedValue(false)
        req.body = {
          _csrf: 'ArcKbKvR-OU86UdNwW8RgAGJjIQ9N081rlgM',
          action: 'startMigration',
          prisonIds: 'MDI,WWI',
        }

        await new AppointmentsMigrationController(
          appointmentsNomisMigrationService,
          nomisMigrationService,
          nomisPrisonerService,
        ).postStartAppointmentsMigration(req, res)

        expect(req.session.startAppointmentsMigrationForm.prisonsNotSwitchedOnNomis).toEqual(['MDI', 'WWI'])
      })

      it('should not show NOMIS feature switch warning', async () => {
        req.body = {
          _csrf: 'ArcKbKvR-OU86UdNwW8RgAGJjIQ9N081rlgM',
          action: 'startMigration',
          prisonIds: 'MDI',
        }

        await new AppointmentsMigrationController(
          appointmentsNomisMigrationService,
          nomisMigrationService,
          nomisPrisonerService,
        ).postStartAppointmentsMigration(req, res)

        expect(req.session.startAppointmentsMigrationForm.prisonsNotSwitchedOnNomis).toEqual([])
      })
    })
  })
})
