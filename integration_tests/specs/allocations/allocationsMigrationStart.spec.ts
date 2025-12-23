import { expect, test } from '@playwright/test'

import moment from 'moment'
import { login, resetStubs } from '../../testUtils'

import nomisMigrationApi from '../../mockApis/nomisMigrationApi'
import IndexPage from '../../pages/indexPage'
import MigrationPage from '../../pages/migrationPage'
import StartMigrationPage from '../../pages/startMigrationPage'
import nomisPrisonerApi from '../../mockApis/nomisPrisonerApi'
import StartMigrationPreviewPage from '../../pages/startMigrationPreviewPage'
import StartMigrationConfirmationPage from '../../pages/startMigrationConfirmationPage'
import nomisAllocationsMigrationApi, {
  allocationsFailures,
  allocationsMigrationHistory,
} from '../../mockApis/nomisAllocationsMigrationApi'

const migrationType: string = 'ALLOCATIONS'
const migrationTypeName: string = 'Allocations'

test.describe('Allocations Migration Start', () => {
  test.afterEach(async () => {
    await resetStubs()
  })
  test.describe('With MIGRATE_ACTIVITIES role', () => {
    test.beforeEach(async ({ page }) => {
      await login(page, { roles: ['ROLE_MIGRATE_ACTIVITIES'] })
      const indexPage = await IndexPage.verifyOnPage(page)
      await nomisMigrationApi.stubGetMigrationHistory({ migrationType, history: allocationsMigrationHistory })
      await indexPage.migrationLink(migrationTypeName).click()
    })
    test('can navigate to start migration page', async ({ page }) => {
      const migrationPage = await MigrationPage.verifyOnPage(migrationTypeName, page)
      await expect(migrationPage.startNewMigration).toBeVisible()
      await migrationPage.startNewMigration.click()
      await StartMigrationPage.verifyOnPage(migrationTypeName, page)
    })

    test('will validate page when selecting start migration', async ({ page }) => {
      const migrationPage = await MigrationPage.verifyOnPage(migrationTypeName, page)
      await migrationPage.startNewMigration.click()

      const startMigrationPage = await StartMigrationPage.verifyOnPage(migrationTypeName, page)
      await startMigrationPage.prisonId.clear()
      await startMigrationPage.getField('courseActivityId').fill('invalid')

      await startMigrationPage.continueButton.click()

      const pageWithErrors = await StartMigrationPage.verifyOnPage(migrationTypeName, page)
      await expect(pageWithErrors.errorSummary.nth(0)).toHaveText('Enter a prison ID.')
      await expect(pageWithErrors.errorSummary.nth(1)).toHaveText('Enter a date.')
      await expect(pageWithErrors.errorSummary.nth(2)).toHaveText('The Course Activity ID must be an integer.')
    })

    test('Preview of migration will be shown and changes allowed prior to starting a migration', async ({ page }) => {
      await nomisAllocationsMigrationApi.stubStartAllocationsMigration({
        migrationId: '2022-03-23T11:11:56',
        estimatedCount: 100_988,
      })
      await nomisMigrationApi.stubGetFailureCountWithMigrationType({ migrationType })
      await nomisMigrationApi.stubGetNoFailuresWithMigrationType({ migrationType })

      const migrationPage = await MigrationPage.verifyOnPage(migrationTypeName, page)
      await migrationPage.startNewMigration.click()

      await nomisPrisonerApi.stubGetAllocationsMigrationEstimatedCount(100_988)

      const startMigrationPage = await StartMigrationPage.verifyOnPage(migrationTypeName, page)
      await startMigrationPage.getField('prisonId').fill('MDI')
      await startMigrationPage.getField('courseActivityId').fill('123456')
      await startMigrationPage.getField('activityStartDate').fill(moment().add(2, 'days').format('YYYY-MM-DD'))
      await startMigrationPage.continueButton.click()

      const previewPage = await StartMigrationPreviewPage.verifyOnPage(migrationTypeName, page)
      await expect(previewPage.estimateSummary).toHaveText(
        'Estimated number of Allocations entities to be migrated: 100,988',
      )

      await expect(previewPage.dlqWarning).toHaveText(
        'There are 153 messages on the migration dead letter queue. Please clear these before starting the migration',
      )

      await expect(previewPage.getFieldRow('prison-id')).toContainText('MDI')
      await expect(previewPage.getFieldRow('course-activity-id')).toContainText('123456')
      await expect(previewPage.getFieldRow('activity-start-date')).toContainText(
        moment().add(2, 'days').format('YYYY-MM-DD'),
      )
      await previewPage.getChangeLink('prison-id').click()

      // amend the from date
      const amendPage = await StartMigrationPage.verifyOnPage(migrationTypeName, page)
      await amendPage.getField('prisonId').clear()
      await amendPage.getField('prisonId').fill('LEI')
      await amendPage.getField('courseActivityId').clear()
      await amendPage.getField('courseActivityId').fill('333333')
      await amendPage.getField('activityStartDate').clear()
      await amendPage.getField('activityStartDate').fill(moment().add(3, 'days').format('YYYY-MM-DD'))
      await amendPage.continueButton.click()

      // check amended date displayed
      const previewPageAgain = await StartMigrationPreviewPage.verifyOnPage(migrationTypeName, page)
      await expect(previewPageAgain.getFieldRow('prison-id')).toContainText('LEI')
      await expect(previewPageAgain.getFieldRow('course-activity-id')).toContainText('333333')
      await expect(previewPageAgain.getFieldRow('activity-start-date')).toContainText(
        moment().add(3, 'days').format('YYYY-MM-DD'),
      )
      await previewPageAgain.startMigrationButton.click()

      const confirmationPage = await StartMigrationConfirmationPage.verifyOnPage(migrationTypeName, page)
      await expect(confirmationPage.confirmationMessage).toContainText('100,988')
      await expect(confirmationPage.confirmationMessage).toContainText('2022-03-23T11:11:56')
      await expect(confirmationPage.detailsLink).toHaveText('View migration status')
    })

    test('Can clear DLQ when there are message still present', async ({ page }) => {
      await nomisAllocationsMigrationApi.stubStartAllocationsMigration({
        migrationId: '2022-03-23T11:11:56',
        estimatedCount: 100_988,
      })
      await nomisMigrationApi.stubGetFailureCountWithMigrationType({ migrationType })
      await nomisMigrationApi.stubGetFailuresWithMigrationType({ migrationType, failures: allocationsFailures })
      await nomisMigrationApi.stubDeleteFailuresWithMigrationType({ migrationType })

      const migrationPage = await MigrationPage.verifyOnPage(migrationTypeName, page)
      await migrationPage.startNewMigration.click()
      await nomisPrisonerApi.stubGetAllocationsMigrationEstimatedCount(100_988)

      const startMigrationPage = await StartMigrationPage.verifyOnPage(migrationTypeName, page)
      await startMigrationPage.prisonId.fill('MDI')
      await startMigrationPage.getField('activityStartDate').fill(moment().add(2, 'days').format('YYYY-MM-DD'))
      await startMigrationPage.continueButton.click()

      const previewPage = await StartMigrationPreviewPage.verifyOnPage(migrationTypeName, page)
      await expect(previewPage.estimateSummary).toHaveText(
        'Estimated number of Allocations entities to be migrated: 100,988',
      )
      await expect(previewPage.dlqWarning).toHaveText(
        'There are 153 messages on the migration dead letter queue. Please clear these before starting the migration',
      )
      await previewPage.clearDlqMessages.click()

      const previewPageAgain = await StartMigrationPreviewPage.verifyOnPage(migrationTypeName, page)
      await previewPageAgain.startMigrationButton.click()
      await StartMigrationConfirmationPage.verifyOnPage(migrationTypeName, page)
    })
  })
})
