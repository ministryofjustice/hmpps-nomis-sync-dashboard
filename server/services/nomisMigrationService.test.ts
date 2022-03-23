import nock from 'nock'
import NomisMigrationService from './nomisMigrationService'
import config from '../config'
import HmppsAuthClient from '../data/hmppsAuthClient'
import TokenStore from '../data/tokenStore'

jest.mock('../data/hmppsAuthClient')
describe('NomisMigrationService tests', () => {
  let nomisMigrationService: NomisMigrationService
  let hmppsAuthClient: jest.Mocked<HmppsAuthClient>

  let fakeNomisMigrationService: nock.Scope

  beforeEach(() => {
    fakeNomisMigrationService = nock(config.apis.nomisMigration.url)
  })

  describe('startVisitsMigration', () => {
    beforeEach(() => {
      hmppsAuthClient = new HmppsAuthClient({} as TokenStore) as jest.Mocked<HmppsAuthClient>
      nomisMigrationService = new NomisMigrationService(hmppsAuthClient)
    })

    it('will allow empty filter to be sent', async () => {
      let filter: unknown
      fakeNomisMigrationService
        .post('/migrate/visits', body => {
          filter = body
          return body
        })
        .reply(200, {
          migrationId: '2022-03-23T11:11:56',
          estimatedCount: 2,
          body: {
            ignoreMissingRoom: false,
          },
        })

      await nomisMigrationService.startVisitsMigration({}, { token: 'some token' })

      expect(filter).toEqual({})
    })
  })

  it('will allow complete filter to be sent', async () => {
    let filter: unknown
    fakeNomisMigrationService
      .post('/migrate/visits', body => {
        filter = body
        return body
      })
      .reply(200, {
        migrationId: '2022-03-23T11:11:56',
        estimatedCount: 2,
        body: {
          prisonIds: ['HEI'],
          visitTypes: ['SCON'],
          fromDateTime: '2022-03-23T12:00:00',
          toDateTime: '2022-03-24T12:00:00',
          ignoreMissingRoom: false,
        },
      })

    await nomisMigrationService.startVisitsMigration(
      {
        prisonIds: ['HEI'],
        visitTypes: ['SCON'],
        fromDateTime: '2022-03-23T12:00:00',
        toDateTime: '2022-03-24T12:00:00',
      },
      { token: 'some token' }
    )

    expect(filter).toEqual({
      prisonIds: ['HEI'],
      visitTypes: ['SCON'],
      fromDateTime: '2022-03-23T12:00:00',
      toDateTime: '2022-03-24T12:00:00',
    })
  })

  it('will return migrationId and estimated count', async () => {
    fakeNomisMigrationService.post('/migrate/visits').reply(200, {
      migrationId: '2022-03-23T11:11:56',
      estimatedCount: 2,
      body: {
        prisonIds: ['HEI'],
        visitTypes: ['SCON'],
        fromDateTime: '2022-03-23T12:00:00',
        toDateTime: '2022-03-24T12:00:00',
        ignoreMissingRoom: false,
      },
    })

    const response = await nomisMigrationService.startVisitsMigration(
      {
        prisonIds: ['HEI'],
        visitTypes: ['SCON'],
        fromDateTime: '2022-03-23T12:00:00',
        toDateTime: '2022-03-24T12:00:00',
      },
      { token: 'some token' }
    )

    expect(response).toEqual(
      expect.objectContaining({
        migrationId: '2022-03-23T11:11:56',
        estimatedCount: 2,
      })
    )
  })
})
