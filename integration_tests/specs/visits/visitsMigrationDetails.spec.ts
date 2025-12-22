import { expect, test } from '@playwright/test'

import { login, resetStubs } from '../../testUtils'

import nomisMigrationApi from '../../mockApis/nomisMigrationApi'
import IndexPage from '../../pages/indexPage'
import MigrationDetailsPage from '../../pages/migrationDetailsPage'

const migrationType: string = 'VISITS'
const migrationTypeName: string = 'Visits'

test.describe('Visit Migration Details', () => {
  const migrationId = '2022-03-28T14:28:04'
  test.afterEach(async () => {
    await resetStubs()
  })

  test.describe('while migration is in progress', () => {
    test.beforeEach(async ({ page }) => {
      await login(page)
      const indexPage = await IndexPage.verifyOnPage(page)
      await indexPage.migrationLinkWithId('visits', migrationTypeName).click()

      await nomisMigrationApi.stubGetActiveMigration({ migrationType, migrationId })
      await nomisMigrationApi.stubGetMigration({
        migrationType,
        migrationId,
        filter:
          '{"prisonIds":["HEI"],"visitTypes":["SCON"],"fromDateTime":"2016-03-23T00:00:00","ignoreMissingRoom":false}',
      })
    })
    test('should details for a migration in progress', async ({ page }) => {
      await page.goto(`/visits-migration/details?migrationId=${migrationId}`)
      const migrationDetailsPage = await MigrationDetailsPage.verifyOnPage(migrationTypeName, page)
      await expect(migrationDetailsPage.status).toContainText('STARTED')
      await expect(migrationDetailsPage.ended).toContainText('-')
      await expect(migrationDetailsPage.migrated).toContainText('1000')
      await expect(migrationDetailsPage.failed).toContainText('100')
      await expect(migrationDetailsPage.stillToBeProcessed).toContainText('23100')
      await expect(migrationDetailsPage.filterFromDate).toHaveText('23 March 2016 - 00:00')
      await expect(migrationDetailsPage.cancel).toHaveText('Cancel migration')
    })
  })
  test.describe('after migration has completed', () => {
    test.beforeEach(async ({ page }) => {
      await login(page)
      const indexPage = await IndexPage.verifyOnPage(page)
      await indexPage.migrationLinkWithId('visits', migrationTypeName).click()

      await nomisMigrationApi.stubGetActiveMigrationCompleted({ migrationType, migrationId })
      await nomisMigrationApi.stubGetMigrationCompleted({
        migrationType,
        migrationId,
        filter:
          '{"prisonIds":["HEI"],"visitTypes":["SCON"],"fromDateTime":"2016-03-23T00:00:00","ignoreMissingRoom":false}',
      })
    })

    test('should details for a migration in progress', async ({ page }) => {
      await page.goto(`/visits-migration/details?migrationId=${migrationId}`)
      const migrationDetailsPage = await MigrationDetailsPage.verifyOnPage(migrationTypeName, page)
      await expect(migrationDetailsPage.status).toContainText('COMPLETED')
      await expect(migrationDetailsPage.ended).toContainText('-')
      await expect(migrationDetailsPage.migrated).toContainText('2000')
      await expect(migrationDetailsPage.failed).toContainText('101')
      await expect(migrationDetailsPage.stillToBeProcessed).toContainText('None')
      await expect(migrationDetailsPage.cancel).toBeHidden()
    })
  })
})
