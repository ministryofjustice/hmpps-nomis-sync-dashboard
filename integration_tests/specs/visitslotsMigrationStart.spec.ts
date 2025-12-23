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

const migrationType: string = 'VISIT_SLOTS'
const migrationTypeName: string = 'Visit Slots'
const migrationTypeName2: string = 'Visit Time Slots'

test.describe('Visit Time Slots Migration Start', () => {
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
      const migrationPage = await MigrationPage.verifyOnPage(migrationTypeName2, page)
      await migrationPage.startNewMigration.click()
      await StartMigrationPage.verifyOnPage(migrationTypeName2, page)
    })

    test('Preview of migration will be shown and changes allowed prior to starting a migration', async ({ page }) => {
      await nomisMigrationApi.stubStartMigration({
        domain: 'visitslots',
        response: {
          migrationId: '2022-03-23T11:11:56',
          estimatedCount: 100_988,
        },
      })
      await nomisMigrationApi.stubGetFailureCountWithMigrationType({ migrationType })
      await nomisMigrationApi.stubGetFailuresWithMigrationType({ migrationType })

      const migrationPage = await MigrationPage.verifyOnPage(migrationTypeName2, page)
      await migrationPage.startNewMigration.click()
      await nomisPrisonerApi.stubGetVisitslotsMigrationEstimatedCount(100_988)

      const startMigrationPage = await StartMigrationPage.verifyOnPage(migrationTypeName2, page)
      await startMigrationPage.continueButton.click()

      const previewPage = await StartMigrationPreviewPage.verifyOnPage(migrationTypeName2, page)
      await expect(previewPage.estimateSummary).toHaveText(
        'Estimated number of Visit Time Slots entities to be migrated: 100,988',
      )
      await expect(previewPage.dlqWarning).toHaveText(
        'There are 153 messages on the migration dead letter queue. Please clear these before starting the migration',
      )
      await previewPage.startMigrationButton.click()

      const confirmationPage = await StartMigrationConfirmationPage.verifyOnPage(migrationTypeName2, page)
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

    test('should not see migrate visit slots tile', async ({ page }) => {
      const indexPage = await IndexPage.verifyOnPage(page)
      await expect(indexPage.migrationLink(migrationTypeName)).toBeHidden()
    })

    test('should not be able to navigate directly to the visit slots migration page', async ({ page }) => {
      await page.goto('/visitslots-migration')
      await AuthErrorPage.verifyOnPage(page)
    })
  })
})
