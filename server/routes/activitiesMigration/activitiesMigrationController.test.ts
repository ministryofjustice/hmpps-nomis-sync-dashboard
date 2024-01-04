import { Request, Response } from 'express'
import moment from 'moment'
import ActivitiesMigrationController from './activitiesMigrationController'
import { HistoricMigrations } from '../../services/nomisMigrationService'
import nomisMigrationService from '../testutils/mockNomisMigrationService'
import nomisPrisonerService from '../testutils/mockNomisPrisonerService'
import activitiesService from '../testutils/mockActivitiesService'

describe('activitiesMigrationController', () => {
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

  describe('getActivitiesMigrations', () => {
    it('should decorate the returned migrations', async () => {
      const activitiesMigrationResponse: HistoricMigrations = {
        migrations: [
          {
            migrationId: '2022-03-30T10:13:56',
            whenStarted: '2022-03-30T10:13:56.878627',
            whenEnded: '2022-03-30T10:14:07.531409',
            estimatedRecordCount: 0,
            filter: '{"prisonId": "MDI"}',
            recordsMigrated: 0,
            recordsFailed: 0,
            migrationType: 'ACTIVITIES',
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
            migrationType: 'ACTIVITIES',
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
          filter: '{"prisonId": "MDI"}',
          recordsMigrated: 0,
          recordsFailed: 0,
          migrationType: 'ACTIVITIES',
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
          filter: '{"prisonIds": "MDI", "courseActivityId": 12345}',
          recordsMigrated: 1,
          recordsFailed: 162794,
          migrationType: 'ACTIVITIES',
          status: 'COMPLETED',
          id: '2022-03-14T11:45:12',
          isNew: false,
          applicationInsightsLink: expect.stringContaining(encodeURIComponent('2022-03-14T11:45:12.615Z')), // GMT was 2022-03-14T11:45:12.615759
        },
      ]
      nomisMigrationService.getActivitiesMigrations.mockResolvedValue(activitiesMigrationResponse)

      await new ActivitiesMigrationController(
        nomisMigrationService,
        nomisPrisonerService,
        activitiesService,
      ).getActivitiesMigrations(req, res)
      expect(res.render).toBeCalled()
      expect(res.render).toBeCalledWith('pages/activities/activitiesMigration', {
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
      nomisMigrationService.getActivitiesFailures.mockResolvedValue({
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
      await new ActivitiesMigrationController(
        nomisMigrationService,
        nomisPrisonerService,
        activitiesService,
      ).viewFailures(req, res)
      expect(res.render).toBeCalledWith('pages/activities/activitiesMigrationFailures', {
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

  describe('postStartActivitiesMigration', () => {
    beforeEach(() => {
      nomisMigrationService.getActivitiesMigrationEstimatedCount.mockResolvedValue(10)
      nomisMigrationService.getActivitiesDLQMessageCount.mockResolvedValue('20')
      nomisPrisonerService.getPrisonIncentiveLevels.mockResolvedValue([
        { code: 'ENT', description: 'Entry' },
        { code: 'STD', description: 'Standard' },
      ])
      nomisPrisonerService.checkServiceAgencySwitch.mockResolvedValue(true)
      activitiesService.getRolloutPrison.mockResolvedValue({
        prisonCode: 'MDI',
        activitiesRolledOut: true,
        activitiesRolloutDate: '2023-01-01',
        appointmentsRolledOut: true,
        appointmentsRolloutDate: '2023-01-01',
      })
      activitiesService.checkPrisonPayBandsExist.mockResolvedValue(true)
    })

    describe('with validation error', () => {
      it('should return an error response', async () => {
        req.body = {
          _csrf: 'ArcKbKvR-OU86UdNwW8RgAGJjIQ9N081rlgM',
          action: 'startMigration',
        }
        await new ActivitiesMigrationController(
          nomisMigrationService,
          nomisPrisonerService,
          activitiesService,
        ).postStartActivitiesMigration(req, res)
        expect(req.flash).toBeCalledWith('errors', [{ href: '#prisonId', text: 'Enter a prison ID.' }])
        expect(res.redirect).toHaveBeenCalledWith('/activities-migration/amend')
      })
    })

    describe('with preview check errors', () => {
      it('should show errors from get activity count', async () => {
        nomisMigrationService.getActivitiesMigrationEstimatedCount.mockRejectedValue({
          data: {
            status: 400,
            userMessage: 'Not found: prison XXX does not exist',
          },
        })
        req.body = {
          _csrf: 'ArcKbKvR-OU86UdNwW8RgAGJjIQ9N081rlgM',
          action: 'startMigration',
          prisonId: 'XXX',
        }
        await new ActivitiesMigrationController(
          nomisMigrationService,
          nomisPrisonerService,
          activitiesService,
        ).postStartActivitiesMigration(req, res)
        expect(req.flash).toBeCalledWith('errors', [
          { href: '', text: 'Failed to get count due to error: Not found: prison XXX does not exist' },
        ])
        expect(res.redirect).toHaveBeenCalledWith('/activities-migration/start/preview')
      })

      it('should show errors from get DLQ count', async () => {
        nomisMigrationService.getActivitiesDLQMessageCount.mockRejectedValue({
          data: {
            status: 504,
            message: 'Gateway Timeout',
          },
        })
        req.body = {
          _csrf: 'ArcKbKvR-OU86UdNwW8RgAGJjIQ9N081rlgM',
          action: 'startMigration',
          prisonId: 'MDI',
        }
        await new ActivitiesMigrationController(
          nomisMigrationService,
          nomisPrisonerService,
          activitiesService,
        ).postStartActivitiesMigration(req, res)
        expect(req.flash).toBeCalledWith('errors', [
          { href: '', text: 'Failed to get DLQ count due to error: Gateway Timeout' },
        ])
        expect(res.redirect).toHaveBeenCalledWith('/activities-migration/start/preview')
      })

      it('should show errors from get prison incentive levels', async () => {
        nomisPrisonerService.getPrisonIncentiveLevels.mockRejectedValue({
          data: {
            status: 404,
            userMessage: 'Not found: Prison XXX does not exist',
          },
        })
        req.body = {
          _csrf: 'ArcKbKvR-OU86UdNwW8RgAGJjIQ9N081rlgM',
          action: 'startMigration',
          prisonId: 'XXX',
        }
        await new ActivitiesMigrationController(
          nomisMigrationService,
          nomisPrisonerService,
          activitiesService,
        ).postStartActivitiesMigration(req, res)
        expect(req.flash).toBeCalledWith('errors', [
          { href: '', text: 'Failed to check incentive levels due to error: Not found: Prison XXX does not exist' },
        ])
        expect(res.redirect).toHaveBeenCalledWith('/activities-migration/start/preview')
      })
    })

    describe('with no errors', () => {
      it('should show results of preview checks', async () => {
        req.body = {
          _csrf: 'ArcKbKvR-OU86UdNwW8RgAGJjIQ9N081rlgM',
          action: 'startMigration',
          prisonId: 'XXX',
        }
        await new ActivitiesMigrationController(
          nomisMigrationService,
          nomisPrisonerService,
          activitiesService,
        ).postStartActivitiesMigration(req, res)
        expect(req.session.startActivitiesMigrationForm.estimatedCount).toBe('10')
        expect(req.session.startActivitiesMigrationForm.dlqCount).toBe('20')
        expect(req.session.startActivitiesMigrationForm.incentiveLevelIds.sort()).toEqual(['STD', 'ENT'].sort())
        expect(req.session.startActivitiesMigrationForm.prisonSwitchedOnNomis).toEqual(true)
        expect(req.session.startActivitiesMigrationForm.prisonSwitchedOnDps).toEqual(true)
        expect(req.session.startActivitiesMigrationForm.dpsPayBandsExist).toEqual(true)
        expect(res.redirect).toHaveBeenCalledWith('/activities-migration/start/preview')
      })

      it('should show DPS feature switch warning if not rolled out', async () => {
        activitiesService.getRolloutPrison.mockResolvedValue({
          prisonCode: 'MDI',
          activitiesRolledOut: false,
          activitiesRolloutDate: null,
          appointmentsRolledOut: true,
          appointmentsRolloutDate: '2023-01-01',
        })

        req.body = {
          _csrf: 'ArcKbKvR-OU86UdNwW8RgAGJjIQ9N081rlgM',
          action: 'startMigration',
          prisonId: 'XXX',
        }
        await new ActivitiesMigrationController(
          nomisMigrationService,
          nomisPrisonerService,
          activitiesService,
        ).postStartActivitiesMigration(req, res)
        expect(req.session.startActivitiesMigrationForm.prisonSwitchedOnDps).toEqual(false)
        expect(res.redirect).toHaveBeenCalledWith('/activities-migration/start/preview')
      })

      it('should show DPS feature switch warning if not rolled out YET', async () => {
        activitiesService.getRolloutPrison.mockResolvedValue({
          prisonCode: 'MDI',
          activitiesRolledOut: false,
          activitiesRolloutDate: moment().add(1, 'days').format('YYYY-MM-DD'),
          appointmentsRolledOut: true,
          appointmentsRolloutDate: '2023-01-01',
        })

        req.body = {
          _csrf: 'ArcKbKvR-OU86UdNwW8RgAGJjIQ9N081rlgM',
          action: 'startMigration',
          prisonId: 'XXX',
        }
        await new ActivitiesMigrationController(
          nomisMigrationService,
          nomisPrisonerService,
          activitiesService,
        ).postStartActivitiesMigration(req, res)
        expect(req.session.startActivitiesMigrationForm.prisonSwitchedOnDps).toEqual(false)
        expect(res.redirect).toHaveBeenCalledWith('/activities-migration/start/preview')
      })
    })
  })
})
