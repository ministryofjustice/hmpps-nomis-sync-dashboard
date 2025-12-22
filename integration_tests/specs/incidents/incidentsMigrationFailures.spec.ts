import { expect, test } from '@playwright/test'

import { login, resetStubs } from '../../testUtils'

import nomisMigrationApi from '../../mockApis/nomisMigrationApi'
import MigrationFailuresPage from '../../pages/migrationFailuresPage'

const migrationType: string = 'INCIDENTS'
const migrationTypeName: string = 'Incidents'

test.describe('Incidents Migration Failures', () => {
  test.afterEach(async () => {
    await resetStubs()
  })
  test.describe('navigating directly to page', () => {
    test.beforeEach(async ({ page }) => {
      await nomisMigrationApi.stubGetFailureCountWithMigrationType({ migrationType })
      await nomisMigrationApi.stubGetFailuresWithMigrationType({ migrationType })
      await login(page)
    })
    test('should see failures rows', async ({ page }) => {
      await page.goto('/incidents-migration/failures')
      const failuresPage = await MigrationFailuresPage.verifyOnPage(migrationTypeName, page)
      await expect(failuresPage.rows).toHaveCount(5)
    })
  })
})
