import nock from 'nock'
import config from '../config'
import VisitsNomisMigrationClient from './visitsNomisMigrationClient'

describe('VisitsNomisMigrationClient tests', () => {
  let nomisMigrationService: VisitsNomisMigrationClient

  let fakeNomisMigrationService: nock.Scope

  beforeEach(() => {
    fakeNomisMigrationService = nock(config.apis.nomisMigration.url)
    nomisMigrationService = new VisitsNomisMigrationClient()
  })

  describe('startVisitsMigration', () => {
    it('will allow minimal filter to be sent', async () => {
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

      await nomisMigrationService.startVisitsMigration(
        { prisonIds: ['HEI'], visitTypes: ['SCON'], ignoreMissingRoom: false },
        { token: 'some token' },
      )

      expect(filter).toEqual({ prisonIds: ['HEI'], visitTypes: ['SCON'], ignoreMissingRoom: false })
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
          ignoreMissingRoom: false,
        },
        { token: 'some token' },
      )

      expect(filter).toEqual({
        prisonIds: ['HEI'],
        visitTypes: ['SCON'],
        fromDateTime: '2022-03-23T12:00:00',
        toDateTime: '2022-03-24T12:00:00',
        ignoreMissingRoom: false,
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
          ignoreMissingRoom: false,
        },
        { token: 'some token' },
      )

      expect(response).toEqual(
        expect.objectContaining({
          migrationId: '2022-03-23T11:11:56',
          estimatedCount: 2,
        }),
      )
    })
  })
})
