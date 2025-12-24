import { expect, test } from '@playwright/test'

import moment from 'moment'
import { login, resetStubs } from '../../testUtils'

import MigrationPage from '../../pages/migrationPage'
import AuthErrorPage from '../../pages/authErrorPage'
import nomisMigrationApi from '../../mockApis/nomisMigrationApi'
import IndexPage from '../../pages/indexPage'
import { activitiesMigrationHistory } from '../../mockApis/nomisActivitiesMigrationApi'
import nomisAllocationsMigrationApi from '../../mockApis/nomisAllocationsMigrationApi'
import nomisPrisonerApi from '../../mockApis/nomisPrisonerApi'
import StartMigrationPage from '../../pages/startMigrationPage'
import StartMigrationPreviewPage from '../../pages/startMigrationPreviewPage'

const migrationType: string = 'ACTIVITIES'
const migrationTypeName: string = 'Activities'

test.describe('Activities Migration Homepage', () => {
  test.afterEach(async () => {
    await resetStubs()
  })
  test.describe('With MIGRATE_ACTIVITIES role', () => {
    test.beforeEach(async ({ page }) => {
      await nomisMigrationApi.stubGetMigrationHistory({ migrationType, history: activitiesMigrationHistory })
      await login(page, { roles: ['ROLE_MIGRATE_ACTIVITIES'] })
    })
    test('should see migrate activities tile', async ({ page }) => {
      const indexPage = await IndexPage.verifyOnPage(page)
      await expect(indexPage.migrationLink(migrationTypeName)).toBeVisible()
    })
    test('should be able to navigate to the activities migration home page', async ({ page }) => {
      const indexPage = await IndexPage.verifyOnPage(page)
      await indexPage.migrationLink(migrationTypeName).click()
      await MigrationPage.verifyOnPage(migrationTypeName, page)
    })

    test('should display list of migrations', async ({ page }) => {
      await nomisMigrationApi.stubGetFailureCountWithMigrationType({ migrationType })
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
      await expect(row0.getByTestId('progress-link')).toBeHidden()
      await expect(row0.getByTestId('all-events-link')).toBeVisible()
      await expect(row0.getByTestId('failures-link')).toBeHidden()
      await expect(row0.getByTestId('already-migrated-link')).toBeHidden()
      await expect(row0.getByTestId('end-activities-button')).toBeVisible()

      const row1 = migrationPage.migrationResultsRow(1)
      await expect(row1.getByTestId('migration-id')).toHaveText('2022-03-14T11:45:12')
      await expect(row1.getByTestId('whenStarted')).toHaveText('14 March 2022 - 11:45')
      await expect(row1.getByTestId('whenEnded')).toBeHidden()
      await expect(row1.getByTestId('status')).toHaveText('STARTED')
      await expect(row1.getByTestId('migratedCount')).toHaveText('1')
      await expect(row1.getByTestId('failedCount')).toHaveText('162794')
      await expect(row1.getByTestId('estimatedCount')).toHaveText('205630')
      await expect(row1.getByTestId('progress-link')).toHaveText('View progress')
      await expect(row0.getByTestId('all-events-link')).toBeVisible()
      await expect(row1.getByTestId('failures-link')).toHaveText('View failures in App Insights')
      await expect(row1.getByTestId('already-migrated-link')).toBeHidden()
      await expect(row0.getByTestId('end-activities-button')).toBeVisible()

      const row2 = migrationPage.migrationResultsRow(2)
      await expect(row2.getByTestId('migration-id')).toHaveText('2022-03-15T11:00:35')
      await expect(row2.getByTestId('whenStarted')).toHaveText('15 March 2022 - 11:00')
      await expect(row2.getByTestId('whenEnded')).toHaveText('15 March 2022 - 11:00')
      await expect(row2.getByTestId('status')).toHaveText('COMPLETED')
      await expect(row2.getByTestId('migratedCount')).toHaveText('0')
      await expect(row2.getByTestId('failedCount')).toHaveText('3')
      await expect(row2.getByTestId('estimatedCount')).toHaveText('4')
      await expect(row2.getByTestId('progress-link')).toBeHidden()
      await expect(row0.getByTestId('all-events-link')).toBeVisible()
      await expect(row2.getByTestId('failures-link')).toHaveText('View failures in App Insights')
      await expect(row2.getByTestId('already-migrated-link')).toHaveText('View ignored activities in AppInsights')
      await expect(row0.getByTestId('end-activities-button')).toBeVisible()
    })

    test('should click through to allocation migration', async ({ page }) => {
      await nomisMigrationApi.stubGetFailureCountWithMigrationType({ migrationType })
      await nomisAllocationsMigrationApi.stubStartAllocationsMigration({
        migrationId: '2022-03-23T11:11:56',
        estimatedCount: 100_988,
      })

      await nomisMigrationApi.stubGetFailureCountWithMigrationType({ migrationType: 'ALLOCATIONS' })
      await nomisMigrationApi.stubGetNoFailuresWithMigrationType({ migrationType: 'ALLOCATIONS' })
      await nomisPrisonerApi.stubGetAllocationsMigrationEstimatedCount(100_988)

      const indexPage = await IndexPage.verifyOnPage(page)
      await indexPage.migrationLink(migrationTypeName).click()
      const migrationPage = await MigrationPage.verifyOnPage(migrationTypeName, page)

      const row1 = migrationPage.migrationResultsRow(1)
      await row1.getByTestId('migrate-allocations-link').click()

      const allocationPage = await StartMigrationPage.verifyOnPage('Allocations', page)
      await expect(allocationPage.prisonId).toHaveValue('WWI')
      await expect(allocationPage.getField('courseActivityId')).toHaveValue('123456')
      // The start date should be disabled but stored in a hidden form field
      await expect(allocationPage.getField('activityStartDate')).toHaveValue(
        moment().add(2, 'days').format('YYYY-MM-DD'),
      )
      await expect(allocationPage.getField('activityStartDate')).toHaveAttribute('disabled')
      await expect(page.getByTestId('hidden-activityStartDate')).toHaveValue(
        moment().add(2, 'days').format('YYYY-MM-DD'),
      )

      // The hidden start date should be pulled through to the preview form
      await allocationPage.continueButton.click()
      const allocationPreviewPage = await StartMigrationPreviewPage.verifyOnPage('Allocations', page)
      await expect(allocationPreviewPage.getFieldRow('activity-start-date')).toContainText(
        moment().add(2, 'days').format('YYYY-MM-DD'),
      )
    })
  })

  test.describe('Without MIGRATE_ACTIVITIES role', () => {
    test.beforeEach(async ({ page }) => {
      await nomisMigrationApi.stubGetMigrationHistory({ migrationType })
      await login(page, { roles: ['ROLE_MIGRATE_PRISONERS'] })
    })
    test('should not see migrate activities tile', async ({ page }) => {
      const indexPage = await IndexPage.verifyOnPage(page)
      await expect(indexPage.migrationLink(migrationTypeName)).toBeHidden()
    })
    test('should not be able to navigate directly to the activities migration page', async ({ page }) => {
      await page.goto('/activities-migration')
      await AuthErrorPage.verifyOnPage(page)
    })
  })
})
