import { expect, test } from '@playwright/test'

import { login, resetStubs } from '../../testUtils'

import MigrationPage from '../../pages/migrationPage'
import AuthErrorPage from '../../pages/authErrorPage'
import nomisMigrationApi from '../../mockApis/nomisMigrationApi'
import IndexPage from '../../pages/indexPage'
import MigrationFailuresPage from '../../pages/migrationFailuresPage'
import { appointmentsMigrationHistory } from '../../mockApis/nomisAppointmentsMigrationApi'

const migrationType: string = 'APPOINTMENTS'
const migrationTypeName: string = 'Appointments'

test.describe('Appointment Migration Homepage', () => {
  test.afterEach(async () => {
    await resetStubs()
  })
  test.describe('With MIGRATE_APPOINTMENTS role', () => {
    test.beforeEach(async ({ page }) => {
      await nomisMigrationApi.stubGetMigrationHistory({ migrationType, history: appointmentsMigrationHistory })
      await login(page, { roles: ['ROLE_MIGRATE_APPOINTMENTS'] })
    })
    test('should see migrate appointments tile', async ({ page }) => {
      const indexPage = await IndexPage.verifyOnPage(page)
      await expect(indexPage.migrationLink(migrationTypeName)).toBeVisible()
    })
    test('should be able to navigate to the appointments migration home page', async ({ page }) => {
      const indexPage = await IndexPage.verifyOnPage(page)
      await indexPage.migrationLink(migrationTypeName).click()
      await MigrationPage.verifyOnPage(migrationTypeName, page)
    })

    test('should display list of migrations', async ({ page }) => {
      await nomisMigrationApi.stubGetNoFailuresWithMigrationType({ migrationType })
      await nomisMigrationApi.stubGetNoFailuresWithMigrationType({ migrationType })

      const indexPage = await IndexPage.verifyOnPage(page)
      await indexPage.migrationLink(migrationTypeName).click()
      const migrationPage = await MigrationPage.verifyOnPage(migrationTypeName, page)

      const row0 = migrationPage.migrationResultsRow(0)
      await expect(row0.getByTestId('migration-id')).toHaveText('2022-03-14T10:13:56')
      await expect(row0.getByTestId('migration-id')).toHaveText('2022-03-14T10:13:56')
      await expect(row0.getByTestId('whenStarted')).toHaveText('14 March 2022 - 10:13')
      await expect(row0.getByTestId('whenEnded')).toHaveText('14 March 2022 - 10:14')
      await expect(row0.getByTestId('status')).toHaveText('COMPLETED')
      await expect(row0.getByTestId('migratedCount')).toHaveText('0')
      await expect(row0.getByTestId('failedCount')).toHaveText('0')
      await expect(row0.getByTestId('estimatedCount')).toHaveText('0')
      await expect(row0.getByTestId('filterPrisonIds')).toBeHidden()
      await expect(row0.getByTestId('filterToDate')).toBeHidden()
      await expect(row0.getByTestId('filterFromDate')).toHaveText('4 March 2022')
      await expect(row0.getByTestId('progress-link')).toBeHidden()
      await expect(row0.getByTestId('failures-link')).toBeHidden()
      await expect(row0.getByTestId('already-migrated-link')).toBeHidden()

      const row1 = migrationPage.migrationResultsRow(1)
      await expect(row1.getByTestId('migration-id')).toHaveText('2022-03-14T11:45:12')
      await expect(row1.getByTestId('whenStarted')).toHaveText('14 March 2022 - 11:45')
      await expect(row1.getByTestId('whenEnded')).toBeHidden()
      await expect(row1.getByTestId('status')).toHaveText('STARTED')
      await expect(row1.getByTestId('migratedCount')).toHaveText('1')
      await expect(row1.getByTestId('failedCount')).toHaveText('162794')
      await expect(row1.getByTestId('estimatedCount')).toHaveText('205630')
      await expect(row1.getByTestId('filterPrisonIds')).toBeHidden()
      await expect(row1.getByTestId('filterToDate')).toBeHidden()
      await expect(row1.getByTestId('filterFromDate')).toBeHidden()
      await expect(row1.getByTestId('progress-link')).toHaveText('View progress')
      await expect(row1.getByTestId('failures-link')).toHaveText('View failures')
      await expect(row1.getByTestId('already-migrated-link')).toHaveText('View Insights')

      const row2 = migrationPage.migrationResultsRow(2)
      await expect(row2.getByTestId('migration-id')).toHaveText('2022-03-15T11:00:35')
      await expect(row2.getByTestId('whenStarted')).toHaveText('15 March 2022 - 11:00')
      await expect(row2.getByTestId('whenEnded')).toHaveText('15 March 2022 - 11:00')
      await expect(row2.getByTestId('status')).toHaveText('COMPLETED')
      await expect(row2.getByTestId('migratedCount')).toHaveText('0')
      await expect(row2.getByTestId('failedCount')).toHaveText('4')
      await expect(row2.getByTestId('filterPrisonIds')).toHaveText('MDI,SWI')
      await expect(row2.getByTestId('filterToDate')).toHaveText('17 April 2022')
      await expect(row2.getByTestId('filterFromDate')).toBeHidden()
      await expect(row2.getByTestId('estimatedCount')).toHaveText('4')
      await expect(row2.getByTestId('progress-link')).toBeHidden()
      await expect(row2.getByTestId('failures-link')).toHaveText('View failures')
      await expect(row2.getByTestId('already-migrated-link')).toBeHidden()

      await row1.getByTestId('failures-link').click()

      await MigrationFailuresPage.verifyOnPage(migrationTypeName, page)
    })
  })

  test.describe('Without MIGRATE_APPOINTMENTS role', () => {
    test.beforeEach(async ({ page }) => {
      await nomisMigrationApi.stubGetMigrationHistory({ migrationType })
      await login(page, { roles: ['ROLE_MIGRATE_PRISONERS'] })
    })
    test('should not see migrate appointments tile', async ({ page }) => {
      const indexPage = await IndexPage.verifyOnPage(page)
      await expect(indexPage.migrationLink(migrationTypeName)).toBeHidden()
    })
    test('should not be able to navigate directly to the appointments migration page', async ({ page }) => {
      await page.goto('/appointments-migration')
      await AuthErrorPage.verifyOnPage(page)
    })
  })
})
