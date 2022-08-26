import nock from 'nock'
import NomisPrisonerService from './nomisPrisonerService'
import config from '../config'
import HmppsAuthClient from '../data/hmppsAuthClient'
import TokenStore from '../data/tokenStore'

jest.mock('../data/hmppsAuthClient')
describe('NomisPrisonerService tests', () => {
  let nomisPrisonerService: NomisPrisonerService
  let hmppsAuthClient: jest.Mocked<HmppsAuthClient>

  let fakeNomisPrisonerService: nock.Scope

  beforeEach(() => {
    fakeNomisPrisonerService = nock(config.apis.nomisPrisoner.url)
  })

  describe('getVisitMigrationEstimatedCount', () => {
    beforeEach(() => {
      hmppsAuthClient = new HmppsAuthClient({} as TokenStore) as jest.Mocked<HmppsAuthClient>
      nomisPrisonerService = new NomisPrisonerService(hmppsAuthClient)
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
          '/visits/ids?prisonIds=HEI&visitTypes=SCON&visitTypes=OFFI&fromDateTime=2022-01-24T02:54:00&toDateTime=2022-01-25T02:54:00&size=1'
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
        { token: 'some token' }
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

  describe('getIncentiveMigrationEstimatedCount', () => {
    beforeEach(() => {
      hmppsAuthClient = new HmppsAuthClient({} as TokenStore) as jest.Mocked<HmppsAuthClient>
      nomisPrisonerService = new NomisPrisonerService(hmppsAuthClient)
    })

    it('will allow empty filter', async () => {
      fakeNomisPrisonerService.get('/incentives/ids?size=1').reply(200, {
        totalElements: 205630,
      })

      await nomisPrisonerService.getIncentiveMigrationEstimatedCount({}, { token: 'some token' })
    })

    it('will allow a complete filter', async () => {
      fakeNomisPrisonerService.get('/incentives/ids?fromDate=2022-01-24&toDate=2022-01-25&size=1').reply(200, {
        totalElements: 205630,
      })

      await nomisPrisonerService.getIncentiveMigrationEstimatedCount(
        {
          fromDate: '2022-01-24',
          toDate: '2022-01-25',
        },
        { token: 'some token' }
      )
    })

    it('will return total count', async () => {
      fakeNomisPrisonerService.get('/incentives/ids?size=1').reply(200, {
        content: [
          {
            bookingId: 180935,
            sequence: 1,
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

      const count = await nomisPrisonerService.getIncentiveMigrationEstimatedCount({}, { token: 'some token' })

      expect(count).toEqual(205630)
    })
  })
})
