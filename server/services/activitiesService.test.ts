import nock from 'nock'
import ActivitiesService from './activitiesService'
import config from '../config'

describe('activitiesService tests', () => {
  let activitiesService: ActivitiesService
  let fakeActivitiesService: nock.Scope

  beforeEach(() => {
    fakeActivitiesService = nock(config.apis.activities.url)
    activitiesService = new ActivitiesService()
  })

  describe('Get Rollout Prison', () => {
    it('should return rollout prison details', async () => {
      fakeActivitiesService.get('/rollout/MDI').reply(200, {
        prisonCode: 'MDI',
        activitiesRolledOut: true,
        activitiesRolloutDate: '2024-01-01',
        appointmentsRolledOut: true,
        appointmentsRolloutDate: '2024-01-01',
      })

      const response = await activitiesService.getRolloutPrison('MDI', { token: 'some token' })

      expect(response).toEqual({
        prisonCode: 'MDI',
        activitiesRolledOut: true,
        activitiesRolloutDate: '2024-01-01',
        appointmentsRolledOut: true,
        appointmentsRolloutDate: '2024-01-01',
      })
    })

    it('should propagate errors', () => {
      fakeActivitiesService.get('/rollout/MDI').reply(500, 'some error').persist(true)

      expect(async () => {
        await activitiesService.getRolloutPrison('MDI', { token: 'some token' })
      }).rejects.toThrow()
    })
  })

  describe('Check prison pay bands', () => {
    it('should return false if not found', async () => {
      fakeActivitiesService.get('/prison/MDI/prison-pay-bands').reply(200, [])

      const response = await activitiesService.checkPrisonPayBandsExist('MDI', { token: 'some token' })

      expect(response).toEqual(false)
    })

    it('should return true if any pay bands found', async () => {
      fakeActivitiesService.get('/prison/MDI/prison-pay-bands').reply(200, [
        {
          id: 11,
          displaySequence: 1,
          alias: 'Low',
          description: 'Pay band 1 (Lowest)',
          nomisPayBand: 1,
          prisonCode: 'MDI',
        },
      ])

      const response = await activitiesService.checkPrisonPayBandsExist('MDI', { token: 'some token' })

      expect(response).toEqual(true)
    })

    it('should propagate errors', () => {
      fakeActivitiesService.get('/prison/MDI/prison-pay-bands').reply(500, 'some error').persist(true)

      expect(async () => {
        await activitiesService.checkPrisonPayBandsExist('MDI', { token: 'some token' })
      }).rejects.toThrow()
    })
  })

  describe('Check prison regime', () => {
    it('should return false if not found', async () => {
      fakeActivitiesService.get('/prison/prison-regime/MDI').reply(404)

      const response = await activitiesService.checkPrisonRegimeExists('MDI', { token: 'some token' })

      expect(response).toEqual(false)
    })

    it('should return true if exists', async () => {
      fakeActivitiesService.get('/prison/prison-regime/MDI').reply(200, {
        id: 1,
        prisonCode: 'MDI',
        amStart: '09:00',
        amFinish: '12:00',
        pmStart: '13:00',
        pmFinish: '16:30',
        edStart: '18:00',
        edFinish: '20:00',
      })

      const response = await activitiesService.checkPrisonRegimeExists('MDI', { token: 'some token' })

      expect(response).toEqual(true)
    })

    it('should propagate errors', () => {
      fakeActivitiesService.get('/prison/prison-regime/MDI').reply(500, 'some error').persist(true)

      expect(async () => {
        await activitiesService.checkPrisonRegimeExists('MDI', { token: 'some token' })
      }).rejects.toThrow()
    })
  })
})
