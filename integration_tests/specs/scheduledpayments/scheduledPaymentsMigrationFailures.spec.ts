import { expect, test } from '@playwright/test'

import { login, resetStubs } from '../../testUtils'
import nomisMigrationApi from '../../mockApis/nomisMigrationApi'
import { scheduledPaymentFailures } from '../../mockApis/nomisPrisonerScheduledPaymentsMigrationApi'
import MigrationFailuresPage from '../../pages/migrationFailuresPage'

const migrationType = 'FINANCE_SCHEDULED_PAYMENTS'
const migrationTypeName = 'Scheduled payments'
const migrationUrl = '/scheduled-payments-migration'

test.describe('Scheduled Payments Migration Failures', () => {
  test.afterEach(async () => {
    await resetStubs()
  })

  test.describe('navigating directly to page', () => {
    test.beforeEach(async ({ page }) => {
      await nomisMigrationApi.stubGetFailureCountWithMigrationType({ migrationType })
      await nomisMigrationApi.stubGetFailuresWithMigrationType({ migrationType, failures: scheduledPaymentFailures })
      await login(page)
    })

    test('should see failures rows', async ({ page }) => {
      await page.goto(`${migrationUrl}/failures`)
      const failuresPage = await MigrationFailuresPage.verifyOnPage(migrationTypeName, page)
      await expect(failuresPage.rows).toHaveCount(2)
    })

    test('should show when there are no unresolved failures', async ({ page }) => {
      await nomisMigrationApi.stubGetNoFailuresWithMigrationType({ migrationType })
      await page.goto(`${migrationUrl}/failures`)
      const failuresPage = await MigrationFailuresPage.verifyOnPage(migrationTypeName, page)
      await expect(failuresPage.rows).toHaveCount(0)
    })
  })
})
