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

const migrationType: string = 'CORE_PERSON'
const migrationTypeName: string = 'Core Person'

test.describe('Core Person Migration Start', () => {
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

    test('Preview of migration will be shown prior to starting a migration', async ({ page }) => {
      await nomisMigrationApi.stubStartMigration({
        domain: 'core-person',
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
      await startMigrationPage.continueButton.click()

      const previewPage = await StartMigrationPreviewPage.verifyOnPage(migrationTypeName, page)
      await expect(previewPage.estimateSummary).toHaveText(
        'Estimated number of Person entities to be migrated: 100,988',
      )
      await expect(previewPage.dlqWarning).toHaveText(
        'There are 153 messages on the migration dead letter queue. Please clear these before starting the migration',
      )

      await previewPage.startMigrationButton.click()

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

    test('should not be able to navigate directly to the core person migration page', async ({ page }) => {
      await page.goto('/coreperson-migration')
      await AuthErrorPage.verifyOnPage(page)
    })
  })
})
