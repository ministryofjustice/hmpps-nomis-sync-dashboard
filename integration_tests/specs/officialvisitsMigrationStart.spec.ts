import { expect, test } from '@playwright/test'

import { login, resetStubs } from '../testUtils'

import MigrationPage from '../pages/migrationPage'
import StartMigrationPage from '../pages/startMigrationPage'
import StartMigrationPreviewPage from '../pages/startMigrationPreviewPage'
import StartMigrationConfirmationPage from '../pages/startMigrationConfirmationPage'
import AuthErrorPage from '../pages/authErrorPage'
import nomisMigrationApi from '../mockApis/nomisMigrationApi'
import IndexPage from '../pages/indexPage'
import nomisPrisonerApi from '../mockApis/nomisPrisonerApi'

const migrationType: string = 'OFFICIAL_VISITS'
const migrationTypeName: string = 'Official Visits'

test.describe('Official visits Migration Start', () => {
  test.afterEach(async () => {
    await resetStubs()
  })

  test.describe('With MIGRATE_NOMIS_SYSCON role', () => {
    test.beforeEach(async ({ page }) => {
      await nomisMigrationApi.stubGetMigrationHistory({ migrationType })
      await login(page)
      const indexPage = await IndexPage.verifyOnPage(page)
      await indexPage.migrationLink(migrationTypeName).click()
    })

    test('can navigate to start migration page', async ({ page }) => {
      const migrationPage = await MigrationPage.verifyOnPage(migrationTypeName, page)
      await migrationPage.startNewMigration.click()
      await StartMigrationPage.verifyOnPage(migrationTypeName, page)
    })

    test('will validate page when selecting start migration', async ({ page }) => {
      const migrationPage = await MigrationPage.verifyOnPage(migrationTypeName, page)
      await migrationPage.startNewMigration.click()

      const startMigrationPage = await StartMigrationPage.verifyOnPage(migrationTypeName, page)

      await startMigrationPage.fromDate.fill('invalid')
      await startMigrationPage.toDate.fill('invalid')

      await startMigrationPage.continueButton.click()

      const pageWithErrors = await StartMigrationPage.verifyOnPage(migrationTypeName, page)

      await expect(pageWithErrors.errorSummary.nth(0)).toHaveText('Enter a real date, like 2020-03-23')
      await expect(pageWithErrors.errorSummary.nth(1)).toHaveText('Enter a real date, like 2020-03-23')
    })

    test('Preview of migration will be shown and changes allowed prior to starting a migration', async ({ page }) => {
      await nomisMigrationApi.stubStartMigration({
        domain: 'official-visits',
        response: {
          migrationId: '2022-03-23T11:11:56',
          estimatedCount: 100_988,
        },
      })
      await nomisMigrationApi.stubGetFailureCountWithMigrationType({ migrationType })
      await nomisMigrationApi.stubGetFailuresWithMigrationType({ migrationType })

      const migrationPage = await MigrationPage.verifyOnPage(migrationTypeName, page)
      await migrationPage.startNewMigration.click()
      await nomisPrisonerApi.stubGetOfficialvisitsMigrationEstimatedCount(100_988)

      const startMigrationPage = await StartMigrationPage.verifyOnPage(migrationTypeName, page)
      await startMigrationPage.fromDate.fill('2020-03-23')
      await startMigrationPage.toDate.fill('2020-03-30')
      await startMigrationPage.continueButton.click()

      const previewPage = await StartMigrationPreviewPage.verifyOnPage(migrationTypeName, page)
      await expect(previewPage.estimateSummary).toHaveText('Estimated number of Visit entities to be migrated: 100,988')
      await expect(previewPage.dlqWarning).toHaveText(
        'There are 153 messages on the migration dead letter queue. Please clear these before starting the migration',
      )

      await expect(previewPage.fromDate.locator('../..')).toContainText('2020-03-23')
      await previewPage.fromDate.click()

      // amend the from date
      const amendPage = await StartMigrationPage.verifyOnPage(migrationTypeName, page)
      await amendPage.fromDate.clear()
      await amendPage.toDate.fill('2020-03-30')
      await amendPage.continueButton.click()

      // check amended date displayed
      const previewPageAgain = await StartMigrationPreviewPage.verifyOnPage(migrationTypeName, page)
      await expect(previewPageAgain.toDate.locator('../..')).toContainText('2020-03-30')
      await previewPageAgain.startMigrationButton.click()

      const confirmationPage = await StartMigrationConfirmationPage.verifyOnPage(migrationTypeName, page)
      await expect(confirmationPage.confirmationMessage).toContainText('100,988')
      await expect(confirmationPage.confirmationMessage).toContainText('2022-03-23T11:11:56')
      await expect(confirmationPage.detailsLink).toHaveText('View migration status')
    })
  })

  test.describe('Without MIGRATE_NOMIS_SYSCON role', () => {
    test.beforeEach(async ({ page }) => {
      await nomisMigrationApi.stubGetMigrationHistory({ migrationType })
      await login(page, { roles: ['ROLE_MIGRATE_PRISONERS'] })
    })

    test('should not see migrate official visits tile', async ({ page }) => {
      const indexPage = await IndexPage.verifyOnPage(page)
      await expect(indexPage.migrationLink(migrationTypeName)).toBeHidden()
    })
    test('should not be able to navigate directly to the official visits migration page', async ({ page }) => {
      await page.goto('/officialvisits-migration')
      await AuthErrorPage.verifyOnPage(page)
    })
  })
})
