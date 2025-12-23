import { expect, test } from '@playwright/test'

import { login, resetStubs } from '../../testUtils'

import nomisMigrationApi from '../../mockApis/nomisMigrationApi'
import IndexPage from '../../pages/indexPage'
import MigrationPage from '../../pages/migrationPage'
import StartMigrationPage from '../../pages/startMigrationPage'
import nomisPrisonerApi from '../../mockApis/nomisPrisonerApi'
import StartMigrationPreviewPage from '../../pages/startMigrationPreviewPage'
import StartMigrationConfirmationPage from '../../pages/startMigrationConfirmationPage'
import nomisVisitsMigrationApi, { visitsMigrationHistory } from '../../mockApis/nomisVisitsMigrationApi'
import VisitsStartMigrationPage from '../../pages/visits/visitsStartMigrationPage'
import VisitsStartMigrationPreviewPage from '../../pages/visits/visitsStartMigrationPreviewPage'

const migrationType: string = 'VISITS'
const migrationTypeName: string = 'Visits'

test.describe('Visits Migration Start', () => {
  test.afterEach(async () => {
    await resetStubs()
  })

  test.describe('With MIGRATE_VISITS role', () => {
    test.beforeEach(async ({ page }) => {
      await login(page)
      const indexPage = await IndexPage.verifyOnPage(page)
      await nomisMigrationApi.stubGetMigrationHistory({ migrationType, history: visitsMigrationHistory })
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

      const startMigrationPage = await VisitsStartMigrationPage.verifyOnPage(migrationTypeName, page)

      await startMigrationPage.prisonIds.clear()
      await startMigrationPage.fromDateTime.fill('invalid')
      await startMigrationPage.toDateTime.fill('invalid')

      await startMigrationPage.continueButton.click()

      const pageWithErrors = await StartMigrationPage.verifyOnPage(migrationTypeName, page)

      await expect(pageWithErrors.errorSummary.nth(0)).toHaveText('Enter one or more prison IDs')
      await expect(pageWithErrors.errorSummary.nth(1)).toHaveText('Enter the type of visits to migrate')
      await expect(pageWithErrors.errorSummary.nth(2)).toHaveText(
        'Enter a real date time, like 2020-03-23T12:00:00 or 2020-03-23',
      )
      await expect(pageWithErrors.errorSummary.nth(3)).toHaveText(
        'Enter a real date time, like 2020-03-23T12:00:00 or 2020-03-23',
      )
    })

    test('Preview of migration will be shown and changes allowed prior to starting a migration', async ({ page }) => {
      await nomisVisitsMigrationApi.stubStartVisitsMigration({
        migrationId: '2022-03-23T11:11:56',
        estimatedCount: 100_988,
      })

      await nomisMigrationApi.stubGetFailureCountWithMigrationType({ migrationType })
      await nomisMigrationApi.stubGetNoFailuresWithMigrationType({ migrationType })

      const migrationPage = await MigrationPage.verifyOnPage(migrationTypeName, page)
      await migrationPage.startNewMigration.click()
      await nomisPrisonerApi.stubGetVisitMigrationEstimatedCount(100_988)
      await nomisVisitsMigrationApi.stubGetVisitMigrationRoomUsage()

      const startMigrationPage = await VisitsStartMigrationPage.verifyOnPage(migrationTypeName, page)
      await startMigrationPage.prisonIds.fill('HEI')
      await startMigrationPage.fromDateTime.fill('2020-03-23T12:00:00')
      await startMigrationPage.toDateTime.fill('2020-03-30T10:00:00')
      await startMigrationPage.socialVisitType.click()

      await startMigrationPage.continueButton.click()

      const previewPage = await VisitsStartMigrationPreviewPage.verifyOnPage(migrationTypeName, page)
      await expect(previewPage.estimateSummary).toHaveText('Estimated number of visits to be migrated: 100,988')

      await expect(previewPage.dlqWarning).toHaveText(
        'There are 153 messages on the migration dead letter queue. Please clear these before starting the migration',
      )

      await expect(previewPage.roomsWarning).toContainText(
        'This migration includes visits rooms that are not mapped. Please add mappings for the following rooms:',
      )
      await expect(previewPage.roomsWarning).not.toContainText('AGI-VISITS-OFF_VIS')
      await expect(previewPage.roomsWarning).toContainText('AGI-VISITS-SOC_VIS')
      await expect(previewPage.roomsWarning).toContainText('14314')
      await expect(previewPage.roomsWarning).not.toContainText('AKI-VISITS-3RD SECTOR')

      await expect(previewPage.fromDateTimeRow).toContainText('2020-03-23T12:00:00')
      await previewPage.fromDateTimeChangeLink.click()

      const amendPage = await VisitsStartMigrationPage.verifyOnPage(migrationTypeName, page)
      await amendPage.fromDateTime.clear()
      await amendPage.fromDateTime.fill('2020-03-20T12:00:00')
      await amendPage.continueButton.click()

      // check amended date displayed
      const previewPageAgain = await VisitsStartMigrationPreviewPage.verifyOnPage(migrationTypeName, page)
      await expect(previewPageAgain.fromDateTimeRow).toContainText('2020-03-20T12:00:00')
      await previewPageAgain.startMigrationButton.click()

      const confirmationPage = await StartMigrationConfirmationPage.verifyOnPage(migrationType, page)
      await expect(confirmationPage.confirmationMessage).toContainText('100,988')
      await expect(confirmationPage.confirmationMessage).toContainText('2022-03-23T11:11:56')
      await expect(confirmationPage.detailsLink).toContainText('View migration status')
    })

    test('Can clear DLQ when there are message still present', async ({ page }) => {
      await nomisVisitsMigrationApi.stubStartVisitsMigration({
        migrationId: '2022-03-23T11:11:56',
        estimatedCount: 100_988,
      })
      await nomisMigrationApi.stubGetFailureCountWithMigrationType({ migrationType })
      await nomisMigrationApi.stubGetNoFailuresWithMigrationType({ migrationType })
      await nomisMigrationApi.stubDeleteFailuresWithMigrationType({ migrationType })

      const migrationPage = await MigrationPage.verifyOnPage(migrationTypeName, page)
      await migrationPage.startNewMigration.click()
      await nomisPrisonerApi.stubGetVisitMigrationEstimatedCount(100_988)
      await nomisVisitsMigrationApi.stubGetVisitMigrationRoomUsage()

      const startMigrationPage = await VisitsStartMigrationPage.verifyOnPage(migrationTypeName, page)
      await startMigrationPage.prisonIds.fill('HEI')
      await startMigrationPage.fromDateTime.fill('2020-03-23T12:00:00')
      await startMigrationPage.toDateTime.fill('2020-03-30T10:00:00')
      await startMigrationPage.socialVisitType.click()

      await startMigrationPage.continueButton.click()
      const previewPage = await StartMigrationPreviewPage.verifyOnPage(migrationTypeName, page)
      await expect(previewPage.estimateSummary).toHaveText('Estimated number of visits to be migrated: 100,988')
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
