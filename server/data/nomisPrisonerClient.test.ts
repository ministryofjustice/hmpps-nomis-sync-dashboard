import nock from 'nock'
import { AuthenticationClient } from '@ministryofjustice/hmpps-auth-clients'
import config from '../config'
import NomisPrisonerClient from './nomisPrisonerClient'

describe('NomisPrisonerClient tests', () => {
  let nomisPrisonerService: NomisPrisonerClient
  let mockAuthenticationClient: jest.Mocked<AuthenticationClient>

  let fakeNomisPrisonerService: nock.Scope

  beforeEach(() => {
    fakeNomisPrisonerService = nock(config.apis.nomisPrisoner.url)
  })

  describe('getVisitMigrationEstimatedCount', () => {
    beforeEach(() => {
      mockAuthenticationClient = {
        getToken: jest.fn().mockResolvedValue('test-system-token'),
      } as unknown as jest.Mocked<AuthenticationClient>
      nomisPrisonerService = new NomisPrisonerClient(mockAuthenticationClient)
    })

    it('will allow empty filter', async () => {
      fakeNomisPrisonerService.get('/visits/ids?size=1').reply(200, {
        totalElements: 205630,
      })

      await nomisPrisonerService.getVisitMigrationEstimatedCount({}, { token: 'some token' })
    })

    it('will allow a complete filter', async () => {
      fakeNomisPrisonerService
        .get(
          '/visits/ids?prisonIds=HEI&visitTypes=SCON&visitTypes=OFFI&fromDateTime=2022-01-24T02:54:00&toDateTime=2022-01-25T02:54:00&size=1',
        )
        .reply(200, {
          totalElements: 205630,
        })

      await nomisPrisonerService.getVisitMigrationEstimatedCount(
        {
          prisonIds: ['HEI'],
          visitTypes: ['SCON', 'OFFI'],
          fromDateTime: '2022-01-24T02:54:00',
          toDateTime: '2022-01-25T02:54:00',
        },
        { token: 'some token' },
      )
    })

    it('will return total count', async () => {
      fakeNomisPrisonerService.get('/visits/ids?size=1').reply(200, {
        content: [
          {
            visitId: 180935,
          },
        ],
        pageable: {
          sort: {
            empty: false,
            sorted: true,
            unsorted: false,
          },
          offset: 0,
          pageSize: 1,
          pageNumber: 0,
          paged: true,
          unpaged: false,
        },
        last: false,
        totalPages: 205630,
        totalElements: 205630,
        size: 1,
        number: 0,
        sort: {
          empty: false,
          sorted: true,
          unsorted: false,
        },
        first: true,
        numberOfElements: 1,
        empty: false,
      })

      const count = await nomisPrisonerService.getVisitMigrationEstimatedCount({}, { token: 'some token' })

      expect(count).toEqual(205630)
    })
  })

  describe('checkServiceAgencySwitch', () => {
    beforeEach(() => {
      mockAuthenticationClient = {
        getToken: jest.fn().mockResolvedValue('test-system-token'),
      } as unknown as jest.Mocked<AuthenticationClient>
      nomisPrisonerService = new NomisPrisonerClient(mockAuthenticationClient)
    })
    it('should return true if found', async () => {
      fakeNomisPrisonerService.get('/service-prisons/ACTIVITY/prison/BXI').reply(204)

      const response = await nomisPrisonerService.checkServiceAgencySwitch('BXI', 'ACTIVITY', { username: 'some user' })

      expect(response).toBeTruthy()
    })
    it('should return false if not found', async () => {
      fakeNomisPrisonerService.get('/service-prisons/ACTIVITY/prison/BXI').reply(404)

      const response = await nomisPrisonerService.checkServiceAgencySwitch('BXI', 'ACTIVITY', { username: 'some user' })

      expect(response).toBeFalsy()
    })
    it('should throw for any other error', () => {
      fakeNomisPrisonerService
        .get('/service-prisons/ACTIVITY/prison/BXI')
        .reply(504, { message: 'Gateway Timeout' })
        .persist(true)

      expect(async () => {
        await nomisPrisonerService.checkServiceAgencySwitch('BXI', 'ACTIVITY', { username: 'some user' })
      }).rejects.toThrow()
    })
  })

  describe('findActivitiesSuspendedAllocations', () => {
    beforeEach(() => {
      mockAuthenticationClient = {
        getToken: jest.fn().mockResolvedValue('test-system-token'),
      } as unknown as jest.Mocked<AuthenticationClient>
      nomisPrisonerService = new NomisPrisonerClient(mockAuthenticationClient)
    })
    it('should return suspended allocations', async () => {
      fakeNomisPrisonerService
        .get('/allocations/suspended')
        .query({ prisonId: 'BXI' })
        .reply(200, [
          { offenderNo: 'A1234AA', courseActivityId: 12345, courseActivityDescription: 'Kitchens AM' },
          { offenderNo: 'A1234AB', courseActivityId: 12346, courseActivityDescription: 'Kitchens PM' },
        ])

      const response = await nomisPrisonerService.findActivitiesSuspendedAllocations(
        { prisonId: 'BXI' },
        { token: 'some token' },
      )

      expect(response).toEqual([
        { offenderNo: 'A1234AA', courseActivityId: 12345, courseActivityDescription: 'Kitchens AM' },
        { offenderNo: 'A1234AB', courseActivityId: 12346, courseActivityDescription: 'Kitchens PM' },
      ])
    })
    it('should throw for any error', () => {
      fakeNomisPrisonerService
        .get('/allocations/suspended')
        .query({ prisonId: 'BXI' })
        .reply(504, { message: 'Gateway Timeout' })
        .persist(true)

      expect(async () => {
        await nomisPrisonerService.findActivitiesSuspendedAllocations({ prisonId: 'BXI' }, { token: 'some token' })
      }).rejects.toThrow()
    })
  })

  describe('getActivitiesMigrationEstimatedCount', () => {
    beforeEach(() => {
      mockAuthenticationClient = {
        getToken: jest.fn().mockResolvedValue('test-system-token'),
      } as unknown as jest.Mocked<AuthenticationClient>
      nomisPrisonerService = new NomisPrisonerClient(mockAuthenticationClient)
    })
    it('should return activity count', async () => {
      fakeNomisPrisonerService
        .get('/activities/ids')
        .query({ prisonId: 'BXI', size: 1 })
        .reply(200, {
          content: [
            {
              courseActivityId: 103914,
            },
            {
              courseActivityId: 103953,
            },
            {
              courseActivityId: 103954,
            },
            {
              courseActivityId: 104051,
            },
            {
              courseActivityId: 104058,
            },
            {
              courseActivityId: 105869,
            },
            {
              courseActivityId: 108047,
            },
            {
              courseActivityId: 108048,
            },
            {
              courseActivityId: 113703,
            },
            {
              courseActivityId: 113874,
            },
          ],
          pageable: {
            pageNumber: 4,
            pageSize: 10,
            sort: {
              empty: false,
              sorted: true,
              unsorted: false,
            },
            offset: 40,
            paged: true,
            unpaged: false,
          },
          last: false,
          totalPages: 26,
          totalElements: 258,
          first: false,
          size: 10,
          number: 4,
          sort: {
            empty: false,
            sorted: true,
            unsorted: false,
          },
          numberOfElements: 10,
          empty: false,
        })

      const response = await nomisPrisonerService.getActivitiesMigrationEstimatedCount(
        { prisonId: 'BXI' },
        { token: 'some token' },
      )

      expect(response).toEqual(258)
    })
    it('should throw for any error', () => {
      fakeNomisPrisonerService
        .get('/activities/ids')
        .query({ prisonId: 'BXI', size: 1 })
        .reply(504, { message: 'Gateway Timeout' })
        .persist(true)

      expect(async () => {
        await nomisPrisonerService.getActivitiesMigrationEstimatedCount({ prisonId: 'BXI' }, { token: 'some token' })
      }).rejects.toThrow()
    })
  })

  describe('getAllocationsMigrationEstimatedCount', () => {
    beforeEach(() => {
      mockAuthenticationClient = {
        getToken: jest.fn().mockResolvedValue('test-system-token'),
      } as unknown as jest.Mocked<AuthenticationClient>
      nomisPrisonerService = new NomisPrisonerClient(mockAuthenticationClient)
    })
    it('should return allocation count', async () => {
      fakeNomisPrisonerService
        .get('/allocations/ids')
        .query({ prisonId: 'BXI', size: 1 })
        .reply(200, {
          content: [
            {
              allocationId: 8439948,
            },
            {
              allocationId: 8439949,
            },
            {
              allocationId: 8495978,
            },
            {
              allocationId: 8536920,
            },
            {
              allocationId: 8638174,
            },
            {
              allocationId: 8638187,
            },
            {
              allocationId: 8757213,
            },
            {
              allocationId: 8995620,
            },
            {
              allocationId: 9034752,
            },
            {
              allocationId: 9034797,
            },
          ],
          pageable: {
            pageNumber: 2,
            pageSize: 10,
            sort: {
              empty: false,
              sorted: true,
              unsorted: false,
            },
            offset: 20,
            paged: true,
            unpaged: false,
          },
          last: false,
          totalPages: 182,
          totalElements: 1816,
          first: false,
          size: 10,
          number: 2,
          sort: {
            empty: false,
            sorted: true,
            unsorted: false,
          },
          numberOfElements: 10,
          empty: false,
        })

      const response = await nomisPrisonerService.getAllocationsMigrationEstimatedCount(
        { prisonId: 'BXI' },
        { token: 'some token' },
      )

      expect(response).toEqual(1816)
    })
    it('should throw for any error', () => {
      fakeNomisPrisonerService
        .get('/allocations/ids')
        .query({ prisonId: 'BXI', size: 1 })
        .reply(504, { message: 'Gateway Timeout' })
        .persist(true)

      expect(async () => {
        await nomisPrisonerService.getAllocationsMigrationEstimatedCount({ prisonId: 'BXI' }, { token: 'some token' })
      }).rejects.toThrow()
    })
  })

  describe('findAllocationsWithMissingPayBands', () => {
    beforeEach(() => {
      mockAuthenticationClient = {
        getToken: jest.fn().mockResolvedValue('test-system-token'),
      } as unknown as jest.Mocked<AuthenticationClient>
      nomisPrisonerService = new NomisPrisonerClient(mockAuthenticationClient)
    })
    it('should return allocations missing pay bands', async () => {
      fakeNomisPrisonerService
        .get('/allocations/missing-pay-bands')
        .query({ prisonId: 'BXI' })
        .reply(200, [
          {
            offenderNo: 'A1234AA',
            incentiveLevel: 'STD',
            courseActivityId: 12345,
            courseActivityDescription: 'Kitchens AM',
          },
          {
            offenderNo: 'A1234AB',
            incentiveLevel: 'BAS',
            courseActivityId: 12346,
            courseActivityDescription: 'Kitchens PM',
          },
        ])

      const response = await nomisPrisonerService.findAllocationsWithMissingPayBands(
        { prisonId: 'BXI' },
        { token: 'some token' },
      )

      expect(response).toEqual([
        {
          offenderNo: 'A1234AA',
          incentiveLevel: 'STD',
          courseActivityId: 12345,
          courseActivityDescription: 'Kitchens AM',
        },
        {
          offenderNo: 'A1234AB',
          incentiveLevel: 'BAS',
          courseActivityId: 12346,
          courseActivityDescription: 'Kitchens PM',
        },
      ])
    })
    it('should throw for any error', () => {
      fakeNomisPrisonerService
        .get('/allocations/missing-pay-bands')
        .query({ prisonId: 'BXI' })
        .reply(504, { message: 'Gateway Timeout' })
        .persist(true)

      expect(async () => {
        await nomisPrisonerService.findAllocationsWithMissingPayBands({ prisonId: 'BXI' }, { token: 'some token' })
      }).rejects.toThrow()
    })
  })

  describe('findPayRatesWithUnknownIncentive', () => {
    beforeEach(() => {
      mockAuthenticationClient = {
        getToken: jest.fn().mockResolvedValue('test-system-token'),
      } as unknown as jest.Mocked<AuthenticationClient>
      nomisPrisonerService = new NomisPrisonerClient(mockAuthenticationClient)
    })
    it('should return pay rates', async () => {
      fakeNomisPrisonerService
        .get('/activities/rates-with-unknown-incentives')
        .query({ prisonId: 'BXI' })
        .reply(200, [
          {
            courseActivityDescription: 'Kitchens AM',
            courseActivityId: 12345,
            payBandCode: '5',
            incentiveLevel: 'STD',
          },
          {
            courseActivityDescription: 'Kitchens PM',
            courseActivityId: 12346,
            payBandCode: '6',
            incentiveLevel: 'BAS',
          },
        ])

      const response = await nomisPrisonerService.findPayRatesWithUnknownIncentive(
        { prisonId: 'BXI' },
        { token: 'some token' },
      )

      expect(response).toEqual([
        {
          courseActivityDescription: 'Kitchens AM',
          courseActivityId: 12345,
          payBandCode: '5',
          incentiveLevel: 'STD',
        },
        {
          courseActivityDescription: 'Kitchens PM',
          courseActivityId: 12346,
          payBandCode: '6',
          incentiveLevel: 'BAS',
        },
      ])
    })
    it('should throw for any error', () => {
      fakeNomisPrisonerService
        .get('/allocations/rates-with-unknown-incentives')
        .query({ prisonId: 'BXI' })
        .reply(504, { message: 'Gateway Timeout' })
        .persist(true)

      expect(async () => {
        await nomisPrisonerService.findPayRatesWithUnknownIncentive({ prisonId: 'BXI' }, { token: 'some token' })
      }).rejects.toThrow()
    })
  })

  describe('findActivitiesWithoutScheduleRules', () => {
    beforeEach(() => {
      mockAuthenticationClient = {
        getToken: jest.fn().mockResolvedValue('test-system-token'),
      } as unknown as jest.Mocked<AuthenticationClient>
      nomisPrisonerService = new NomisPrisonerClient(mockAuthenticationClient)
    })
    it('should return activities', async () => {
      fakeNomisPrisonerService
        .get('/activities/without-schedule-rules')
        .query({ prisonId: 'BXI' })
        .reply(200, [
          {
            courseActivityDescription: 'Kitchens AM',
            courseActivityId: 12345,
          },
          {
            courseActivityDescription: 'Kitchens PM',
            courseActivityId: 12346,
          },
        ])

      const response = await nomisPrisonerService.findActivitiesWithoutScheduleRules(
        { prisonId: 'BXI' },
        { token: 'some token' },
      )

      expect(response).toEqual([
        {
          courseActivityDescription: 'Kitchens AM',
          courseActivityId: 12345,
        },
        {
          courseActivityDescription: 'Kitchens PM',
          courseActivityId: 12346,
        },
      ])
    })
    it('should throw for any error', () => {
      fakeNomisPrisonerService
        .get('/allocations/without-schedule-rules')
        .query({ prisonId: 'BXI' })
        .reply(504, { message: 'Gateway Timeout' })
        .persist(true)

      expect(async () => {
        await nomisPrisonerService.findActivitiesWithoutScheduleRules({ prisonId: 'BXI' }, { token: 'some token' })
      }).rejects.toThrow()
    })
  })

  describe('findAppointmentsCounts', () => {
    beforeEach(() => {
      mockAuthenticationClient = {
        getToken: jest.fn().mockResolvedValue('test-system-token'),
      } as unknown as jest.Mocked<AuthenticationClient>
      nomisPrisonerService = new NomisPrisonerClient(mockAuthenticationClient)
    })
    it('should return appointment counts', async () => {
      fakeNomisPrisonerService
        .get('/appointments/counts')
        .query({ prisonIds: ['BXI', 'MDI'] })
        .reply(200, [
          {
            prisonId: 'BXI',
            eventSubType: 'ACTI',
            future: false,
            count: 5,
          },
          {
            prisonId: 'BXI',
            eventSubType: 'ACTI',
            future: true,
            count: 7,
          },
          {
            prisonId: 'BXI',
            eventSubType: 'CABA',
            future: false,
            count: 9,
          },
          {
            prisonId: 'MDI',
            eventSubType: 'ACTI',
            future: false,
            count: 12,
          },
        ])

      const response = await nomisPrisonerService.findAppointmentCounts(
        { prisonIds: ['BXI', 'MDI'] },
        { token: 'some token' },
      )

      expect(response).toEqual([
        {
          prisonId: 'BXI',
          eventSubType: 'ACTI',
          future: false,
          count: 5,
        },
        {
          prisonId: 'BXI',
          eventSubType: 'ACTI',
          future: true,
          count: 7,
        },
        {
          prisonId: 'BXI',
          eventSubType: 'CABA',
          future: false,
          count: 9,
        },
        {
          prisonId: 'MDI',
          eventSubType: 'ACTI',
          future: false,
          count: 12,
        },
      ])
    })
    it('should throw for any error', () => {
      fakeNomisPrisonerService
        .get('/appointments/counts')
        .query({ prisonIds: ['BXI', 'MDI'] })
        .reply(504, { message: 'Gateway Timeout' })
        .persist(true)

      expect(async () => {
        await nomisPrisonerService.findAppointmentCounts({ prisonIds: ['BXI', 'MDI'] }, { token: 'some token' })
      }).rejects.toThrow()
    })
  })
})
