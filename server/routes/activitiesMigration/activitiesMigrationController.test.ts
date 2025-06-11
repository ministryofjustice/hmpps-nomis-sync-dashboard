import { Request, Response } from 'express'
import moment from 'moment'
import ActivitiesMigrationController from './activitiesMigrationController'
import { HistoricMigrations } from '../../data/nomisMigrationClient'
import activitiesNomisMigrationService from '../testutils/mockActivitiesNomisMigrationService'
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

  const tomorrow = moment().add(1, 'days').format('YYYY-MM-DD')

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
            filter: '{"prisonIds": "MDI", "activityStartDate": "2022-03-15", "courseActivityId": 12345}',
            recordsMigrated: 1,
            recordsFailed: 162794,
            migrationType: 'ACTIVITIES',
            status: 'COMPLETED',
            id: '2022-03-14T11:45:12',
            isNew: false,
          },
          {
            migrationId: '2022-03-11T11:45:12',
            whenStarted: '2022-03-11T11:45:12.615759',
            whenEnded: '2022-03-11T13:26:10.047061',
            estimatedRecordCount: 1,
            filter: '{"prisonIds": "MDI", "activityStartDate": "2022-03-15", "courseActivityId": 12345}',
            recordsMigrated: 0,
            recordsFailed: 0,
            migrationType: 'ACTIVITIES',
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
          migrationType: 'ACTIVITIES',
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
          filter: '{"prisonIds": "MDI", "activityStartDate": "2022-03-15", "courseActivityId": 12345}',
          recordsMigrated: 1,
          recordsFailed: 162794,
          migrationType: 'ACTIVITIES',
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
          filter: '{"prisonIds": "MDI", "activityStartDate": "2022-03-15", "courseActivityId": 12345}',
          recordsMigrated: 0,
          recordsFailed: 0,
          migrationType: 'ACTIVITIES',
          status: 'COMPLETED',
          id: '2022-03-11T11:45:12',
          isNew: false,
          appInsightsFullMigrationLink: expect.stringContaining(encodeURIComponent('2022-03-11T11:45:12.615Z')), // GMT was 2022-03-14T11:45:12.615759
          appInsightsActivityIgnoredLink: expect.stringContaining(encodeURIComponent('2022-03-11T11:45:12.615Z')), // GMT was 2022-03-14T11:45:12.615759
        },
      ]
      nomisMigrationService.getMigrationHistory.mockResolvedValue(activitiesMigrationResponse)

      await new ActivitiesMigrationController(
        activitiesNomisMigrationService,
        nomisMigrationService,
        nomisPrisonerService,
        activitiesService,
      ).getActivitiesMigrations(req, res)
      expect(res.render).toHaveBeenCalled()
      expect(res.render).toHaveBeenCalledWith('pages/activities/activitiesMigration', {
        migrations: expect.arrayContaining([
          expect.objectContaining(decoratedMigrations[0]),
          expect.objectContaining(decoratedMigrations[1]),
          expect.objectContaining(decoratedMigrations[2]),
        ]),
        errors: expect.arrayContaining([]),
      })
    })
  })

  describe('postStartActivitiesMigration', () => {
    beforeEach(() => {
      nomisPrisonerService.getActivitiesMigrationEstimatedCount.mockResolvedValue(10)
      nomisMigrationService.getFailureCount.mockResolvedValue('20')
      nomisPrisonerService.getPrisonIncentiveLevels.mockResolvedValue([
        { code: 'ENT', description: 'Entry' },
        { code: 'STD', description: 'Standard' },
      ])
      nomisPrisonerService.checkServiceAgencySwitch.mockResolvedValue(true)
      activitiesService.getRolloutPrison.mockResolvedValue({
        prisonCode: 'MDI',
        activitiesRolledOut: true,
        appointmentsRolledOut: true,
        maxDaysToExpiry: 10,
        prisonLive: true,
      })
      activitiesService.checkPrisonPayBandsExist.mockResolvedValue(true)
      activitiesService.checkPrisonRegimeExists.mockResolvedValue(true)
      nomisPrisonerService.findActivitiesSuspendedAllocations.mockResolvedValue([
        { courseActivityDescription: 'Kitchens PM', courseActivityId: 12345, offenderNo: 'A1234AA' },
        { courseActivityDescription: 'Kitchens PM', courseActivityId: 12345, offenderNo: 'B1234BB' },
        { courseActivityDescription: 'Kitchens AM', courseActivityId: 12346, offenderNo: 'A1234AA' },
      ])
      nomisPrisonerService.findAllocationsWithMissingPayBands.mockResolvedValue([
        {
          courseActivityDescription: 'Kitchens PM',
          courseActivityId: 12345,
          offenderNo: 'A1234AA',
          incentiveLevel: 'STD',
        },
        {
          courseActivityDescription: 'Kitchens PM',
          courseActivityId: 12345,
          offenderNo: 'B1234BB',
          incentiveLevel: 'STD',
        },
        {
          courseActivityDescription: 'Kitchens AM',
          courseActivityId: 12346,
          offenderNo: 'A1234AA',
          incentiveLevel: 'BAS',
        },
      ])
      nomisPrisonerService.findPayRatesWithUnknownIncentive.mockResolvedValue([
        {
          courseActivityDescription: 'Kitchens AM',
          courseActivityId: 12346,
          payBandCode: '6',
          incentiveLevelCode: 'BAS',
        },
        {
          courseActivityDescription: 'Kitchens PM',
          courseActivityId: 12345,
          payBandCode: '5',
          incentiveLevelCode: 'STD',
        },
      ])
      nomisPrisonerService.findActivitiesWithoutScheduleRules.mockResolvedValue([
        {
          courseActivityDescription: 'Kitchens AM',
          courseActivityId: 12346,
        },
        {
          courseActivityDescription: 'Kitchens PM',
          courseActivityId: 12345,
          payBandCode: '5',
          incentiveLevelCode: 'STD',
        },
      ])
    })

    describe('with validation error', () => {
      it('should return an error response', async () => {
        req.body = {
          _csrf: 'ArcKbKvR-OU86UdNwW8RgAGJjIQ9N081rlgM',
          action: 'startMigration',
          activityStartDate: tomorrow,
        }
        await new ActivitiesMigrationController(
          activitiesNomisMigrationService,
          nomisMigrationService,
          nomisPrisonerService,
          activitiesService,
        ).postStartActivitiesMigration(req, res)
        expect(req.flash).toHaveBeenCalledWith('errors', [{ href: '#prisonId', text: 'Enter a prison ID.' }])
        expect(res.redirect).toHaveBeenCalledWith('/activities-migration/amend')
      })
    })

    describe('with preview check errors', () => {
      it('should show errors from get activity count', async () => {
        nomisPrisonerService.getActivitiesMigrationEstimatedCount.mockRejectedValue({
          data: {
            status: 400,
            userMessage: 'Not found: prison XXX does not exist',
          },
        })
        req.body = {
          _csrf: 'ArcKbKvR-OU86UdNwW8RgAGJjIQ9N081rlgM',
          action: 'startMigration',
          prisonId: 'XXX',
          activityStartDate: tomorrow,
        }
        await new ActivitiesMigrationController(
          activitiesNomisMigrationService,
          nomisMigrationService,
          nomisPrisonerService,
          activitiesService,
        ).postStartActivitiesMigration(req, res)
        expect(req.flash).toHaveBeenCalledWith('errors', [
          { href: '', text: 'Failed to get count due to error: Not found: prison XXX does not exist' },
        ])
        expect(res.redirect).toHaveBeenCalledWith('/activities-migration/start/preview')
      })

      it('should show errors from get DLQ count', async () => {
        nomisMigrationService.getFailureCount.mockRejectedValue({
          data: {
            status: 504,
            message: 'Gateway Timeout',
          },
        })
        req.body = {
          _csrf: 'ArcKbKvR-OU86UdNwW8RgAGJjIQ9N081rlgM',
          action: 'startMigration',
          prisonId: 'MDI',
          activityStartDate: tomorrow,
        }
        await new ActivitiesMigrationController(
          activitiesNomisMigrationService,
          nomisMigrationService,
          nomisPrisonerService,
          activitiesService,
        ).postStartActivitiesMigration(req, res)
        expect(req.flash).toHaveBeenCalledWith('errors', [
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
          activityStartDate: tomorrow,
        }
        await new ActivitiesMigrationController(
          activitiesNomisMigrationService,
          nomisMigrationService,
          nomisPrisonerService,
          activitiesService,
        ).postStartActivitiesMigration(req, res)
        expect(req.flash).toHaveBeenCalledWith('errors', [
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
          activityStartDate: tomorrow,
        }
        await new ActivitiesMigrationController(
          activitiesNomisMigrationService,
          nomisMigrationService,
          nomisPrisonerService,
          activitiesService,
        ).postStartActivitiesMigration(req, res)
        expect(req.session.startActivitiesMigrationForm.estimatedCount).toBe('8')
        expect(req.session.startActivitiesMigrationForm.dlqCount).toBe('20')
        expect(req.session.startActivitiesMigrationForm.incentiveLevelIds.sort()).toEqual(['STD', 'ENT'].sort())
        expect(req.session.startActivitiesMigrationForm.prisonSwitchedOnNomis).toEqual(true)
        expect(req.session.startActivitiesMigrationForm.prisonSwitchedOnDps).toEqual(true)
        expect(req.session.startActivitiesMigrationForm.dpsPayBandsExist).toEqual(true)
        expect(req.session.startActivitiesMigrationForm.dpsPrisonRegimeExists).toEqual(true)
        expect(req.session.startActivitiesMigrationForm.suspendedAllocations).toEqual([
          `Activity Description, Activity ID, Prisoner Number,`,
          `Kitchens AM, 12346, A1234AA,`,
          `Kitchens PM, 12345, A1234AA,`,
          `Kitchens PM, 12345, B1234BB,`,
        ])
        expect(req.session.startActivitiesMigrationForm.allocationsMissingPayBands).toEqual([
          `Activity Description, Activity ID, Prisoner Number, Incentive Level,`,
          `Kitchens AM, 12346, A1234AA, BAS,`,
          `Kitchens PM, 12345, A1234AA, STD,`,
          `Kitchens PM, 12345, B1234BB, STD,`,
        ])
        expect(req.session.startActivitiesMigrationForm.payRatesUnknownIncentive).toEqual([
          `Activity Description, Activity ID, Pay Band Code, Incentive Level,`,
          `Kitchens AM, 12346, 6, BAS,`,
          `Kitchens PM, 12345, 5, STD,`,
        ])
        expect(req.session.startActivitiesMigrationForm.activitiesWithoutScheduleRules).toEqual([
          `Activity Description, Activity ID,`,
          `Kitchens AM, 12346,`,
          `Kitchens PM, 12345,`,
        ])
        expect(res.redirect).toHaveBeenCalledWith('/activities-migration/start/preview')
      })

      it('should show DPS feature switch warning if not rolled out', async () => {
        activitiesService.getRolloutPrison.mockResolvedValue({
          prisonCode: 'MDI',
          activitiesRolledOut: false,
          appointmentsRolledOut: true,
          maxDaysToExpiry: 10,
          prisonLive: true,
        })

        req.body = {
          _csrf: 'ArcKbKvR-OU86UdNwW8RgAGJjIQ9N081rlgM',
          action: 'startMigration',
          prisonId: 'XXX',
          activityStartDate: tomorrow,
        }
        await new ActivitiesMigrationController(
          activitiesNomisMigrationService,
          nomisMigrationService,
          nomisPrisonerService,
          activitiesService,
        ).postStartActivitiesMigration(req, res)
        expect(req.session.startActivitiesMigrationForm.prisonSwitchedOnDps).toEqual(false)
        expect(res.redirect).toHaveBeenCalledWith('/activities-migration/start/preview')
      })

      it('should NOT show DPS feature switch warning and ignore the rollout date if returned', async () => {
        activitiesService.getRolloutPrison.mockResolvedValue({
          prisonCode: 'MDI',
          activitiesRolledOut: true,
          appointmentsRolledOut: true,
          maxDaysToExpiry: 10,
          prisonLive: true,
        })

        req.body = {
          _csrf: 'ArcKbKvR-OU86UdNwW8RgAGJjIQ9N081rlgM',
          action: 'startMigration',
          prisonId: 'XXX',
          activityStartDate: tomorrow,
        }
        await new ActivitiesMigrationController(
          activitiesNomisMigrationService,
          nomisMigrationService,
          nomisPrisonerService,
          activitiesService,
        ).postStartActivitiesMigration(req, res)
        expect(req.session.startActivitiesMigrationForm.prisonSwitchedOnDps).toEqual(true)
        expect(res.redirect).toHaveBeenCalledWith('/activities-migration/start/preview')
      })
    })
  })
})
