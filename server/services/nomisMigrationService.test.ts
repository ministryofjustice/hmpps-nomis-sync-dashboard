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
    hmppsAuthClient = new HmppsAuthClient({} as TokenStore) as jest.Mocked<HmppsAuthClient>
    nomisMigrationService = new NomisMigrationService(hmppsAuthClient)
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
        { token: 'some token' }
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
        { token: 'some token' }
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

  describe('cancelVisitsMigration', () => {
    it('will cancel migration', async () => {
      fakeNomisMigrationService.post('/migrate/visits/2022-03-23T11:11:56/cancel').reply(202, {})

      const response = await nomisMigrationService.cancelVisitsMigration('2022-03-23T11:11:56', { token: 'some token' })

      expect(response).toEqual({})
    })
  })

  describe('getFailures', () => {
    it('will return message for current DLQ ', async () => {
      fakeNomisMigrationService.get('/health').reply(200, {
        status: 'UP',
        components: {
          OAuthApiHealth: {
            status: 'UP',
            details: {
              HttpStatus: 'OK',
            },
          },
          diskSpace: {
            status: 'UP',
            details: {
              total: 107361579008,
              free: 19944652800,
              threshold: 10485760,
              exists: true,
            },
          },
          healthInfo: {
            status: 'UP',
            details: {
              version: '2022-03-24.562.6c6b00d',
            },
          },
          livenessState: {
            status: 'UP',
          },
          'migration-health': {
            status: 'UP',
            details: {
              queueName: 'dps-syscon-dev-migration_queue',
              messagesOnQueue: '0',
              messagesInFlight: '0',
              dlqStatus: 'UP',
              dlqName: 'dps-syscon-dev-migration_dlq',
              messagesOnDlq: '153',
            },
          },
          nomisApiHealth: {
            status: 'UP',
            details: {
              HttpStatus: 'OK',
            },
          },
          ping: {
            status: 'UP',
          },
          r2dbc: {
            status: 'UP',
            details: {
              database: 'PostgreSQL',
              validationQuery: 'validate(REMOTE)',
            },
          },
          readinessState: {
            status: 'UP',
          },
          visitMappingApi: {
            status: 'UP',
            details: {
              HttpStatus: 'OK',
            },
          },
          visitsApi: {
            status: 'UP',
            details: {
              HttpStatus: 'OK',
            },
          },
        },
        groups: ['liveness', 'readiness'],
      })
      fakeNomisMigrationService.get('/queue-admin-async/get-dlq-messages/dps-syscon-dev-migration_dlq').reply(200, {
        messagesFoundCount: 353,
        messagesReturnedCount: 5,
        messages: [
          {
            body: {
              context: {
                migrationId: '2022-03-23T16:12:43',
                estimatedCount: 93,
                body: {
                  visitId: 10310112,
                },
              },
              type: 'MIGRATE_VISIT',
            },
            messageId: 'afeb75fd-a2aa-41c4-9ede-b6bfe9590d36',
          },
          {
            body: {
              context: {
                migrationId: '2022-03-23T16:12:43',
                estimatedCount: 93,
                body: {
                  visitId: 10309678,
                },
              },
              type: 'MIGRATE_VISIT',
            },
            messageId: '86b96f0e-2ac3-445c-b3ac-0a4d525d371e',
          },
          {
            body: {
              context: {
                migrationId: '2022-03-24T13:39:33',
                estimatedCount: 292,
                body: {
                  visitId: 10243234,
                },
              },
              type: 'MIGRATE_VISIT',
            },
            messageId: '7e37a1e0-f041-42bc-9c2d-1da82d3bb83b',
          },
          {
            body: {
              context: {
                migrationId: '2022-03-24T13:39:33',
                estimatedCount: 292,
                body: {
                  visitId: 10243119,
                },
              },
              type: 'MIGRATE_VISIT',
            },
            messageId: '8d87f4d7-7846-48b2-ae93-5a7878dba502',
          },
          {
            body: {
              context: {
                migrationId: '2022-03-24T13:39:33',
                estimatedCount: 292,
                body: {
                  visitId: 10245176,
                },
              },
              type: 'MIGRATE_VISIT',
            },
            messageId: '230dcb1f-3391-4630-b907-3923ec9e0ee4',
          },
        ],
      })
      const messages = await nomisMigrationService.getFailures({ token: 'some token' })

      expect(messages).toEqual(
        expect.objectContaining({
          messagesFoundCount: 353,
          messagesReturnedCount: 5,
          messages: expect.arrayContaining([
            expect.objectContaining({
              messageId: 'afeb75fd-a2aa-41c4-9ede-b6bfe9590d36',
            }),
            expect.objectContaining({
              messageId: '86b96f0e-2ac3-445c-b3ac-0a4d525d371e',
            }),
            expect.objectContaining({
              messageId: '7e37a1e0-f041-42bc-9c2d-1da82d3bb83b',
            }),
            expect.objectContaining({
              messageId: '8d87f4d7-7846-48b2-ae93-5a7878dba502',
            }),
            expect.objectContaining({
              messageId: '230dcb1f-3391-4630-b907-3923ec9e0ee4',
            }),
          ]),
        })
      )
    })
  })

  describe('deleteFailures', () => {
    it('will delete message on current DLQ ', async () => {
      fakeNomisMigrationService.get('/health').reply(200, {
        status: 'UP',
        components: {
          'migration-health': {
            status: 'UP',
            details: {
              queueName: 'dps-syscon-dev-migration_queue',
              messagesOnQueue: '0',
              messagesInFlight: '0',
              dlqStatus: 'UP',
              dlqName: 'dps-syscon-dev-migration_dlq',
              messagesOnDlq: '153',
            },
          },
        },
      })
      fakeNomisMigrationService.put('/queue-admin-async/purge-queue/dps-syscon-dev-migration_dlq').reply(200, {
        messagesFoundCount: 5,
      })
      const count = await nomisMigrationService.deleteFailures({ token: 'some token' })

      expect(count).toEqual(
        expect.objectContaining({
          messagesFoundCount: 5,
        })
      )
    })
  })

  describe('getVisitMigration', () => {
    it('will return message lengths along with history', async () => {
      fakeNomisMigrationService.get('/info').reply(200, {
        git: {
          branch: 'main',
          commit: {
            id: '909b9e9',
            time: '2022-03-28T09:48:07Z',
          },
        },
        build: {
          operatingSystem: 'Linux (5.4.0-1021-gcp)',
          version: '2022-03-28.585.909b9e9',
          artifact: 'hmpps-prisoner-from-nomis-migration',
          machine: '07616ee6ca3c',
          by: 'root',
          name: 'hmpps-prisoner-from-nomis-migration',
          time: '2022-03-28T09:51:17.920Z',
          group: 'uk.gov.justice.digital.hmpps',
        },
        'last visits migration': {
          'records waiting processing': '2367',
          'records currently being processed': '0',
          'records that have failed': '353',
          id: '2022-03-24T13:39:33',
          'records migrated': 1,
          started: '2022-03-14T13:10:54.073256',
        },
      })
      fakeNomisMigrationService.get('/migrate/visits/history/2022-03-24T13:39:33').reply(200, {
        migrationId: '2022-03-24T13:39:33',
        whenStarted: '2022-03-24T13:39:33.477466',
        whenEnded: '2022-03-24T13:41:39.83053',
        estimatedRecordCount: 292,
        filter:
          '{"prisonIds":["HEI"],"visitTypes":["SCON"],"fromDateTime":"2017-03-23T12:00:00","ignoreMissingRoom":false}',
        recordsMigrated: 0,
        recordsFailed: 353,
        migrationType: 'VISITS',
        status: 'COMPLETED',
        id: '2022-03-24T13:39:33',
      })
      const summary = await nomisMigrationService.getVisitsMigration('2022-03-24T13:39:33', { token: 'some token' })

      expect(summary).toEqual(
        expect.objectContaining({
          history: {
            migrationId: '2022-03-24T13:39:33',
            whenStarted: '2022-03-24T13:39:33.477466',
            whenEnded: '2022-03-24T13:41:39.83053',
            estimatedRecordCount: 292,
            filter:
              '{"prisonIds":["HEI"],"visitTypes":["SCON"],"fromDateTime":"2017-03-23T12:00:00","ignoreMissingRoom":false}',
            recordsMigrated: 0,
            recordsFailed: 353,
            migrationType: 'VISITS',
            status: 'COMPLETED',
            id: '2022-03-24T13:39:33',
          },
          currentProgress: {
            recordsFailed: '353',
            recordsToBeProcessed: '2367',
            recordsMigrated: 1,
          },
        })
      )
    })
    it('will not return current count when migration mapping has not been written yet so migrationIds do not match', async () => {
      fakeNomisMigrationService.get('/info').reply(200, {
        git: {
          branch: 'main',
          commit: {
            id: '909b9e9',
            time: '2022-03-28T09:48:07Z',
          },
        },
        build: {
          operatingSystem: 'Linux (5.4.0-1021-gcp)',
          version: '2022-03-28.585.909b9e9',
          artifact: 'hmpps-prisoner-from-nomis-migration',
          machine: '07616ee6ca3c',
          by: 'root',
          name: 'hmpps-prisoner-from-nomis-migration',
          time: '2022-03-28T09:51:17.920Z',
          group: 'uk.gov.justice.digital.hmpps',
        },
        'last visits migration': {
          'records waiting processing': '2367',
          'records currently being processed': '0',
          'records that have failed': '353',
          id: '2021-02-24T11:39:33',
          'records migrated': 999,
          started: '2022-03-14T13:10:54.073256',
        },
      })
      fakeNomisMigrationService.get('/migrate/visits/history/2022-03-24T13:39:33').reply(200, {
        migrationId: '2022-03-24T13:39:33',
        whenStarted: '2022-03-24T13:39:33.477466',
        whenEnded: '2022-03-24T13:41:39.83053',
        estimatedRecordCount: 292,
        filter:
          '{"prisonIds":["HEI"],"visitTypes":["SCON"],"fromDateTime":"2017-03-23T12:00:00","ignoreMissingRoom":false}',
        recordsMigrated: 0,
        recordsFailed: 353,
        migrationType: 'VISITS',
        status: 'COMPLETED',
        id: '2022-03-24T13:39:33',
      })
      const summary = await nomisMigrationService.getVisitsMigration('2022-03-24T13:39:33', { token: 'some token' })

      expect(summary).toEqual(
        expect.objectContaining({
          currentProgress: expect.objectContaining({
            recordsMigrated: 0,
          }),
        })
      )
    })
  })
})
