import { expect, test } from '@playwright/test'

import { login, resetStubs } from '../../testUtils'
import nomisMigrationApi from '../../mockApis/nomisMigrationApi'
import { prisonerAdvancesFailures } from '../../mockApis/nomisPrisonerAdvancesMigrationApi'
import MigrationFailuresPage from '../../pages/migrationFailuresPage'

const migrationType = 'PRISONER_ADVANCES'
const migrationTypeName = 'Advances'

test.describe('Advances Migration Failures', () => {
  test.afterEach(async () => {
    await resetStubs()
  })

  test.describe('navigating directly to page', () => {
    test.beforeEach(async ({ page }) => {
      await nomisMigrationApi.stubGetFailureCountWithMigrationType({ migrationType })
      await nomisMigrationApi.stubGetFailuresWithMigrationType({ migrationType, failures: prisonerAdvancesFailures })
      await login(page)
    })

    test('should see failures rows', async ({ page }) => {
      await page.goto('/advances-migration/failures')
      const failuresPage = await MigrationFailuresPage.verifyOnPage(migrationTypeName, page)
      await expect(failuresPage.rows).toHaveCount(2)
    })

    test('should show when there are no unresolved failures', async ({ page }) => {
      await nomisMigrationApi.stubGetNoFailuresWithMigrationType({ migrationType })
      await page.goto('/advances-migration/failures')
      const failuresPage = await MigrationFailuresPage.verifyOnPage(migrationTypeName, page)
      await expect(failuresPage.rows).toHaveCount(0)
    })
  })
})
