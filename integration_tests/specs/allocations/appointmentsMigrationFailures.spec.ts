import { expect, test } from '@playwright/test'

import { login, resetStubs } from '../../testUtils'

import nomisMigrationApi from '../../mockApis/nomisMigrationApi'
import MigrationFailuresPage from '../../pages/migrationFailuresPage'
import { appointmentsFailures } from '../../mockApis/nomisAppointmentsMigrationApi'

const migrationType: string = 'APPOINTMENTS'
const migrationTypeName: string = 'Appointments'

test.describe('Appointment Migration Failures', () => {
  test.afterEach(async () => {
    await resetStubs()
  })
  test.describe('navigating directly to page', () => {
    test.beforeEach(async ({ page }) => {
      await nomisMigrationApi.stubGetFailureCountWithMigrationType({ migrationType })
      await nomisMigrationApi.stubGetFailuresWithMigrationType({ migrationType, failures: appointmentsFailures })
      await login(page, { roles: ['ROLE_MIGRATE_APPOINTMENTS'] })
    })
    test('should see failures rows', async ({ page }) => {
      await page.goto('/appointments-migration/failures')
      const failuresPage = await MigrationFailuresPage.verifyOnPage(migrationTypeName, page)
      await expect(failuresPage.rows).toHaveCount(5)
    })
  })
})
