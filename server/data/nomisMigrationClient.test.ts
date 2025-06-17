import nock from 'nock'
import { AuthenticationClient } from '@ministryofjustice/hmpps-auth-clients'
import NomisMigrationClient from './nomisMigrationClient'
import config from '../config'

describe('NomisMigrationClient tests', () => {
  let nomisMigrationService: NomisMigrationClient
  let mockAuthenticationClient: jest.Mocked<AuthenticationClient>
  let fakeNomisMigrationService: nock.Scope

  beforeEach(() => {
    fakeNomisMigrationService = nock(config.apis.nomisMigration.url)

    mockAuthenticationClient = {
      getToken: jest.fn().mockResolvedValue('test-system-token'),
    } as unknown as jest.Mocked<AuthenticationClient>
    nomisMigrationService = new NomisMigrationClient(mockAuthenticationClient)
  })

  describe('cancelMigration', () => {
    it('will cancel migration', async () => {
      fakeNomisMigrationService.post('/migrate/cancel/2022-03-23T11:11:56').reply(202, {})

      const response = await nomisMigrationService.cancelMigration('2022-03-23T11:11:56', { token: 'some token' })

      expect(response).toEqual({})
    })
  })

  describe('getFailures', () => {
    it('will return message for current DLQ ', async () => {
      fakeNomisMigrationService.get('/migrate/dead-letter-queue/count').reply(200, '153')
      fakeNomisMigrationService.get('/migrate/dead-letter-queue/VISITS').reply(200, {
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
      const messages = await nomisMigrationService.getFailures('VISITS', { token: 'some token' })

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
        }),
      )
    })
  })

  describe('deleteFailures', () => {
    it('will delete message on current DLQ ', async () => {
      fakeNomisMigrationService.get('/migrate/dead-letter-queue/count').reply(200, '153')
      fakeNomisMigrationService.delete('/migrate/dead-letter-queue/VISITS').reply(200, {
        messagesFoundCount: 5,
      })
      const count = await nomisMigrationService.deleteFailures('VISITS', { token: 'some token' })

      expect(count).toEqual(
        expect.objectContaining({
          messagesFoundCount: 5,
        }),
      )
    })
  })

  describe('getMigration', () => {
    it('will return message lengths along with history', async () => {
      fakeNomisMigrationService.get('/migrate/history/2022-03-24T13:39:33').reply(200, {
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
      fakeNomisMigrationService.get('/migrate/history/active/VISITS').reply(200, {
        recordsMigrated: 1,
        toBeProcessedCount: 2367,
        beingProcessedCount: 0,
        recordsFailed: 353,
        migrationId: '2022-03-24T13:39:33',
        whenStarted: '2022-03-24T13:39:33.477466',
        estimatedRecordCount: 6,
        migrationType: 'VISITS',
        status: 'STARTED',
      })
      const summary = await nomisMigrationService.getMigration('2022-03-24T13:39:33', { token: 'some token' })

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
            recordsFailed: 353,
            recordsToBeProcessed: 2367,
            recordsMigrated: 1,
          },
        }),
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
        'last VISITS migration': {
          'records waiting processing': '2367',
          'records currently being processed': '0',
          'records that have failed': '353',
          id: '2021-02-24T11:39:33',
          'records migrated': 999,
          started: '2022-03-14T13:10:54.073256',
        },
      })
      fakeNomisMigrationService.get('/migrate/history/active/VISITS').reply(200, {
        recordsMigrated: 999,
        toBeProcessedCount: 2367,
        beingProcessedCount: 0,
        recordsFailed: 353,
        migrationId: '2021-02-24T11:39:33',
        whenStarted: '2022-03-14T13:10:54.073256',
        estimatedRecordCount: 6,
        migrationType: 'VISITS',
        status: 'STARTED',
      })
      fakeNomisMigrationService.get('/migrate/history/2022-03-24T13:39:33').reply(200, {
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
      const summary = await nomisMigrationService.getMigration('2022-03-24T13:39:33', { token: 'some token' })

      expect(summary).toEqual(
        expect.objectContaining({
          currentProgress: expect.objectContaining({
            recordsMigrated: 0,
          }),
        }),
      )
    })
  })
})
