import { expect, test } from '@playwright/test'

import { login, resetStubs } from '../../testUtils'
import nomisMigrationApi from '../../mockApis/nomisMigrationApi'
import IndexPage from '../../pages/indexPage'
import MigrationDetailsPage from '../../pages/migrationDetailsPage'
import scheduledPaymentsMigrationHistory from '../../mockApis/nomisPrisonerScheduledPaymentsMigrationApi'

const migrationType = 'FINANCE_SCHEDULED_PAYMENTS'
const migrationTypeName = 'Scheduled payments'
const migrationId = '2026-10-28T11:45:12'
const migrationUrl = '/scheduled-payments-migration'

test.describe('Scheduled Payments Migration Details', () => {
  test.afterEach(async () => {
    await resetStubs()
  })

  test.beforeEach(async ({ page }) => {
    await nomisMigrationApi.stubGetMigrationHistory({ migrationType, history: scheduledPaymentsMigrationHistory })
    await login(page)
    const indexPage = await IndexPage.verifyOnPage(page)
    await indexPage.migrationLink(migrationTypeName).click()
  })

  test.describe('while migration is in progress', () => {
    test.beforeEach(async () => {
      await nomisMigrationApi.stubGetActiveMigration({ migrationType, migrationId })
      await nomisMigrationApi.stubGetMigration({ migrationType, migrationId, filter: '{}' })
    })

    test('should show details for a migration in progress', async ({ page }) => {
      await page.goto(`${migrationUrl}/details?migrationId=${migrationId}`)
      const migrationDetailsPage = await MigrationDetailsPage.verifyOnPage(migrationTypeName, page)
      await expect(migrationDetailsPage.status).toContainText('STARTED')
      await expect(migrationDetailsPage.ended).toContainText('-')
      await expect(migrationDetailsPage.migrated).toContainText('1000')
      await expect(migrationDetailsPage.failed).toContainText('100')
      await expect(migrationDetailsPage.stillToBeProcessed).toContainText('23100')
      await expect(migrationDetailsPage.cancel).toHaveText('Cancel migration')
    })
  })

  test.describe('after migration has completed', () => {
    test.beforeEach(async () => {
      await nomisMigrationApi.stubGetActiveMigrationCompleted({ migrationType, migrationId })
      await nomisMigrationApi.stubGetMigrationCompleted({
        migrationType,
        migrationId,
        filter: '{}',
        whenEnded: '2026-10-28T12:59:24.657071',
      })
    })

    test('should show details for a completed migration', async ({ page }) => {
      await page.goto(`${migrationUrl}/details?migrationId=${migrationId}`)
      const migrationDetailsPage = await MigrationDetailsPage.verifyOnPage(migrationTypeName, page)
      await expect(migrationDetailsPage.status).toContainText('COMPLETED')
      await expect(migrationDetailsPage.ended).toContainText('28 October 2026 - 12:59')
      await expect(migrationDetailsPage.migrated).toContainText('2000')
      await expect(migrationDetailsPage.failed).toContainText('101')
      await expect(migrationDetailsPage.stillToBeProcessed).toContainText('None')
      await expect(migrationDetailsPage.cancel).toBeHidden()
    })
  })
})
