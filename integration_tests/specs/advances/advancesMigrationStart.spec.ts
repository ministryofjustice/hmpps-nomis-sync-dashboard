import { expect, test } from '@playwright/test'

import { login, resetStubs } from '../../testUtils'
import IndexPage from '../../pages/indexPage'
import MigrationPage from '../../pages/migrationPage'
import StartMigrationPage from '../../pages/startMigrationPage'
import StartMigrationPreviewPage from '../../pages/startMigrationPreviewPage'
import StartMigrationConfirmationPage from '../../pages/startMigrationConfirmationPage'
import nomisMigrationApi from '../../mockApis/nomisMigrationApi'
import nomisPrisonerApi from '../../mockApis/nomisPrisonerApi'
import prisonerAdvancesMigrationHistory from '../../mockApis/nomisPrisonerAdvancesMigrationApi'

const migrationType = 'PRISONER_ADVANCES'
const migrationTypeName = 'Advances'

test.describe('Advances Migration Start', () => {
  test.afterEach(async () => {
    await resetStubs()
  })

  test.describe('With MIGRATE_NOMIS_SYSCON role', () => {
    test.beforeEach(async ({ page }) => {
      await nomisMigrationApi.stubGetMigrationHistory({ migrationType, history: prisonerAdvancesMigrationHistory })
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
        domain: 'prisoner-advances',
        response: {
          migrationId: '2026-10-06T12:00:00',
          estimatedCount: 180_664,
          type: migrationType,
        },
      })
      await nomisMigrationApi.stubGetFailureCountWithMigrationType({ migrationType })
      await nomisPrisonerApi.stubGetAdvancesMigrationEstimatedCount(180_664)

      const migrationPage = await MigrationPage.verifyOnPage(migrationTypeName, page)
      await migrationPage.startNewMigration.click()
      const startMigrationPage = await StartMigrationPage.verifyOnPage(migrationTypeName, page)
      await startMigrationPage.continueButton.click()

      const previewPage = await StartMigrationPreviewPage.verifyOnPage(migrationTypeName, page)
      await expect(previewPage.estimateSummary).toHaveText(
        'Estimated number of Advances entities to be migrated: 180,664',
      )
      await expect(previewPage.dlqWarning).toHaveText(
        'There are 153 messages on the migration dead letter queue. Please clear these before starting the migration',
      )
      await previewPage.startMigrationButton.click()

      const confirmationPage = await StartMigrationConfirmationPage.verifyOnPage(migrationTypeName, page)
      await expect(confirmationPage.confirmationMessage).toContainText('180,664')
      await expect(confirmationPage.confirmationMessage).toContainText('2026-10-06T12:00:00')
      await expect(confirmationPage.detailsLink).toHaveText('View migration status')
      await expect(confirmationPage.detailsLink).toHaveAttribute(
        'href',
        '/advances-migration/details?migrationId=2026-10-06T12:00:00',
      )
    })

    test('Can clear DLQ when there are messages still present', async ({ page }) => {
      await nomisMigrationApi.stubStartMigration({
        domain: 'prisoner-advances',
        response: {
          migrationId: '2026-10-06T12:00:00',
          estimatedCount: 180_664,
          type: migrationType,
        },
      })
      await nomisMigrationApi.stubGetFailureCountWithMigrationType({ migrationType })
      await nomisMigrationApi.stubDeleteFailuresWithMigrationType({ migrationType })
      await nomisPrisonerApi.stubGetAdvancesMigrationEstimatedCount(180_664)

      const migrationPage = await MigrationPage.verifyOnPage(migrationTypeName, page)
      await migrationPage.startNewMigration.click()
      const startMigrationPage = await StartMigrationPage.verifyOnPage(migrationTypeName, page)
      await startMigrationPage.continueButton.click()

      const previewPage = await StartMigrationPreviewPage.verifyOnPage(migrationTypeName, page)
      await expect(previewPage.estimateSummary).toHaveText(
        'Estimated number of Advances entities to be migrated: 180,664',
      )
      await expect(previewPage.dlqWarning).toHaveText(
        'There are 153 messages on the migration dead letter queue. Please clear these before starting the migration',
      )
      await nomisMigrationApi.stubGetFailureCountWithMigrationType({ migrationType, failures: 0 })
      await previewPage.clearDlqMessages.click()

      const previewPageAgain = await StartMigrationPreviewPage.verifyOnPage(migrationTypeName, page)
      await expect(previewPageAgain.dlqWarning).toBeHidden()
      await expect(previewPageAgain.estimateSummary).toHaveText(
        'Estimated number of Advances entities to be migrated: 180,664',
      )
      await previewPageAgain.startMigrationButton.click()
      await StartMigrationConfirmationPage.verifyOnPage(migrationTypeName, page)
    })
  })
})
