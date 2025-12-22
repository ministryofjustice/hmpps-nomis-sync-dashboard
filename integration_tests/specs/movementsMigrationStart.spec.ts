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

const migrationType: string = 'EXTERNAL_MOVEMENTS'
const migrationTypeName: string = 'Temporary Absence'

test.describe('Movements Migration Start', () => {
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
    test('Preview of migration will be shown and changes allowed prior to starting a migration', async ({ page }) => {
      await nomisMigrationApi.stubStartMigration({
        domain: 'external-movements',
        response: {
          migrationId: '2022-03-23T11:11:56',
          estimatedCount: 100_988,
        },
      })

      await nomisMigrationApi.stubGetFailureCountWithMigrationType({ migrationType })
      await nomisMigrationApi.stubGetFailuresWithMigrationType({ migrationType })

      const migrationPage = await MigrationPage.verifyOnPage(migrationTypeName, page)
      await migrationPage.startNewMigration.click()
      await nomisPrisonerApi.stubGetPrisonersMigrationEstimatedCount(100_988)

      const startMigrationPage = await StartMigrationPage.verifyOnPage(migrationTypeName, page)
      await startMigrationPage.prisonerNumber.fill('A1234BC')

      await startMigrationPage.continueButton.click()

      const previewPage = await StartMigrationPreviewPage.verifyOnPage(migrationTypeName, page)
      await expect(previewPage.estimateSummary).toHaveText('Estimated number of prisoners to be migrated: 1')
      await expect(previewPage.dlqWarning).toHaveText(
        'There are 153 messages on the migration dead letter queue. Please clear these before starting the migration',
      )

      await expect(previewPage.prisonerNumber.locator('../..')).toContainText('A1234BC')
      await previewPage.prisonerNumber.click()

      const startMigration2Page = await StartMigrationPage.verifyOnPage(migrationTypeName, page)
      await startMigration2Page.prisonerNumber.clear()
      await startMigration2Page.continueButton.click()

      // check amended date displayed
      const previewPageAgain = await StartMigrationPreviewPage.verifyOnPage(migrationTypeName, page)
      await expect(previewPage.estimateSummary).toHaveText('Estimated number of prisoners to be migrated: 100,988')
      await expect(previewPageAgain.prisonerNumber).toBeHidden()
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

    test('should not see migrate contact person tile', async ({ page }) => {
      const indexPage = await IndexPage.verifyOnPage(page)
      await expect(indexPage.migrationLink(migrationTypeName)).toBeHidden()
    })

    test('should not be able to navigate directly to the movements migration page', async ({ page }) => {
      await page.goto('/movements-migration')
      await AuthErrorPage.verifyOnPage(page)
    })
  })
})
