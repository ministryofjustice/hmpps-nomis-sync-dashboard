import { expect, test } from '@playwright/test'

import { login, resetStubs } from '../../testUtils'

import nomisMigrationApi from '../../mockApis/nomisMigrationApi'
import IndexPage from '../../pages/indexPage'
import prisonerBalanceMigrationHistory from '../../mockApis/nomisPrisonerBalanceMigrationApi'
import MigrationPage from '../../pages/migrationPage'
import StartMigrationPage from '../../pages/startMigrationPage'
import nomisPrisonerApi from '../../mockApis/nomisPrisonerApi'
import StartMigrationPreviewPage from '../../pages/startMigrationPreviewPage'
import StartMigrationConfirmationPage from '../../pages/startMigrationConfirmationPage'

const migrationType: string = 'PRISONER_BALANCE'
const migrationTypeName: string = 'Prisoner balance'

test.describe('Prisoner Balance Migration Start', () => {
  test.afterEach(async () => {
    await resetStubs()
  })
  test.describe('With MIGRATE_NOMIS_SYSCON role', () => {
    test.beforeEach(async ({ page }) => {
      await login(page)
      const indexPage = await IndexPage.verifyOnPage(page)
      await nomisMigrationApi.stubGetMigrationHistory({ migrationType, history: prisonerBalanceMigrationHistory })
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
      await startMigrationPage.prisonId.fill('invalid')

      await startMigrationPage.continueButton.click()

      const pageWithErrors = await StartMigrationPage.verifyOnPage(migrationTypeName, page)
      await expect(pageWithErrors.errorSummary).toHaveText('The prison ID must contain 3 letters')
    })

    test('will ensure prison id is optional when selecting start migration', async ({ page }) => {
      await nomisMigrationApi.stubStartMigration({
        domain: 'prisoner-balance',
        response: {
          migrationId: '2022-03-23T11:11:56',
          estimatedCount: 100_988,
        },
      })
      await nomisMigrationApi.stubGetFailureCountWithMigrationType({ migrationType })
      await nomisMigrationApi.stubGetNoFailuresWithMigrationType({ migrationType })

      const migrationPage = await MigrationPage.verifyOnPage(migrationTypeName, page)
      await migrationPage.startNewMigration.click()

      await nomisPrisonerApi.stubGetPrisonerBalanceMigrationEstimatedCount(100_988)

      const startMigrationPage = await StartMigrationPage.verifyOnPage(migrationTypeName, page)
      await startMigrationPage.continueButton.click()

      const previewPage = await StartMigrationPreviewPage.verifyOnPage(migrationTypeName, page)
      await expect(previewPage.estimateSummary).toHaveText(
        'Estimated number of prisoner balance entities to be migrated: 100,988',
      )
    })

    test('Preview of migration will be shown and changes allowed prior to starting a migration', async ({ page }) => {
      await nomisMigrationApi.stubStartMigration({
        domain: 'prisoner-balance',
        response: {
          migrationId: '2022-03-23T11:11:56',
          estimatedCount: 100_988,
        },
      })
      await nomisMigrationApi.stubGetFailureCountWithMigrationType({ migrationType })
      await nomisMigrationApi.stubGetFailuresWithMigrationType({ migrationType })

      const migrationPage = await MigrationPage.verifyOnPage(migrationTypeName, page)
      await migrationPage.startNewMigration.click()

      await nomisPrisonerApi.stubGetPrisonerBalanceMigrationEstimatedCount(1)

      const startMigrationPage = await StartMigrationPage.verifyOnPage(migrationTypeName, page)
      await startMigrationPage.prisonId.fill('MDI')
      await startMigrationPage.continueButton.click()

      const previewPage = await StartMigrationPreviewPage.verifyOnPage(migrationTypeName, page)
      await expect(previewPage.estimateSummary).toHaveText(
        'Estimated number of prisoner balance entities to be migrated: 1',
      )

      await expect(previewPage.dlqWarning).toHaveText(
        'There are 153 messages on the migration dead letter queue. Please clear these before starting the migration',
      )

      await expect(previewPage.prisonId.locator('../..')).toContainText('MDI')
      await previewPage.prisonId.click()

      // amend the prison id
      const startMigration2Page = await StartMigrationPage.verifyOnPage(migrationTypeName, page)
      await startMigration2Page.prisonId.fill('DNI')
      await startMigration2Page.continueButton.click()

      // check amended date displayed
      const previewPageAgain = await StartMigrationPreviewPage.verifyOnPage(migrationTypeName, page)
      await expect(previewPageAgain.prisonId.locator('../..')).toContainText('DNI')
      await previewPageAgain.startMigrationButton.click()

      const confirmationPage = await StartMigrationConfirmationPage.verifyOnPage(migrationTypeName, page)
      await expect(confirmationPage.confirmationMessage).toContainText('100,988')
      await expect(confirmationPage.confirmationMessage).toContainText('2022-03-23T11:11:56')
      await expect(confirmationPage.detailsLink).toHaveText('View migration status')
    })
  })
})
