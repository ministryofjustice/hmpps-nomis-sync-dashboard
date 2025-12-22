import { expect, test } from '@playwright/test'

import { login, resetStubs } from '../../testUtils'

import nomisMigrationApi from '../../mockApis/nomisMigrationApi'
import MigrationFailuresPage from '../../pages/migrationFailuresPage'
import { visitsFailures } from '../../mockApis/nomisVisitsMigrationApi'

const migrationType: string = 'VISITS'
const migrationTypeName: string = 'Visits'

test.describe('Visit Migration Failures', () => {
  test.afterEach(async () => {
    await resetStubs()
  })
  test.describe('navigating directly to page', () => {
    test.beforeEach(async ({ page }) => {
      await nomisMigrationApi.stubGetFailureCountWithMigrationType({ migrationType })
      await nomisMigrationApi.stubGetFailuresWithMigrationType({ migrationType, failures: visitsFailures })
      await login(page)
    })
    test('should failures rows', async ({ page }) => {
      await page.goto('/visits-migration/failures')
      const failuresPage = await MigrationFailuresPage.verifyOnPage(migrationTypeName, page)
      await expect(failuresPage.rows).toHaveCount(5)
    })
  })
})
