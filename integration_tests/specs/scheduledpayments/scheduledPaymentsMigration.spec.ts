import { expect, test } from '@playwright/test'

import { login, resetStubs } from '../../testUtils'
import IndexPage from '../../pages/indexPage'
import MigrationPage from '../../pages/migrationPage'
import StartMigrationPage from '../../pages/startMigrationPage'
import StartMigrationPreviewPage from '../../pages/startMigrationPreviewPage'
import StartMigrationConfirmationPage from '../../pages/startMigrationConfirmationPage'
import nomisMigrationApi from '../../mockApis/nomisMigrationApi'
import nomisPrisonerApi from '../../mockApis/nomisPrisonerApi'
import scheduledPaymentsMigrationHistory from '../../mockApis/nomisPrisonerScheduledPaymentsMigrationApi'
import AuthErrorPage from '../../pages/authErrorPage'
import MigrationFailuresPage from '../../pages/migrationFailuresPage'

const migrationType = 'FINANCE_SCHEDULED_PAYMENTS'
const migrationTypeName = 'Scheduled payments'
const migrationUrl = '/scheduled-payments-migration'

test.describe('Scheduled payments migration', () => {
  test.afterEach(async () => {
    await resetStubs()
  })

  test.describe('With MIGRATE_NOMIS_SYSCON role', () => {
    test.beforeEach(async ({ page }) => {
      await nomisMigrationApi.stubGetMigrationHistory({ migrationType, history: scheduledPaymentsMigrationHistory })
      await login(page)
    })

    test('should see migrate scheduled payments tile', async ({ page }) => {
      const indexPage = await IndexPage.verifyOnPage(page)
      await expect(indexPage.migrationLink(migrationTypeName)).toBeVisible()
    })

    test('should be able to navigate to the scheduled payments migration home page', async ({ page }) => {
      const indexPage = await IndexPage.verifyOnPage(page)
      await indexPage.migrationLink(migrationTypeName).click()
      await MigrationPage.verifyOnPage(migrationTypeName, page)
    })

    test('should display list of migrations', async ({ page }) => {
      await nomisMigrationApi.stubGetNoFailuresWithMigrationType({ migrationType })
      await nomisMigrationApi.stubGetFailureCountWithMigrationType({ migrationType })

      const indexPage = await IndexPage.verifyOnPage(page)
      await indexPage.migrationLink(migrationTypeName).click()
      const migrationPage = await MigrationPage.verifyOnPage(migrationTypeName, page)

      const row0 = migrationPage.migrationResultsRow(0)
      await expect(row0.getByTestId('migration-id')).toHaveText('2026-10-28T10:13:56')
      await expect(row0.getByTestId('whenStarted')).toHaveText('28 October 2026 - 10:13')
      await expect(row0.getByTestId('whenEnded')).toHaveText('28 October 2026 - 10:14')
      await expect(row0.getByTestId('status')).toHaveText('COMPLETED')
      await expect(row0.getByTestId('migratedCount')).toHaveText('0')
      await expect(row0.getByTestId('failedCount')).toHaveText('0')
      await expect(row0.getByTestId('estimatedCount')).toHaveText('0')
      await expect(row0.getByTestId('progress-link')).toBeHidden()
      await expect(row0.getByTestId('failures-link')).toBeHidden()
      await expect(row0.getByTestId('already-migrated-link')).toBeHidden()

      const row1 = migrationPage.migrationResultsRow(1)
      await expect(row1.getByTestId('migration-id')).toHaveText('2026-10-28T11:45:12')
      await expect(row1.getByTestId('whenStarted')).toHaveText('28 October 2026 - 11:45')
      await expect(row1.getByTestId('whenEnded')).toBeHidden()
      await expect(row1.getByTestId('status')).toHaveText('STARTED')
      await expect(row1.getByTestId('migratedCount')).toHaveText('1')
      await expect(row1.getByTestId('failedCount')).toHaveText('162')
      await expect(row1.getByTestId('estimatedCount')).toHaveText('205')
      await expect(row1.getByTestId('progress-link')).toHaveText('View progress')
      await expect(row1.getByTestId('progress-link')).toHaveAttribute(
        'href',
        `${migrationUrl}/details?migrationId=2026-10-28T11:45:12`,
      )
      await expect(row1.getByTestId('failures-link')).toHaveText('View failures')
      await expect(row1.getByTestId('already-migrated-link')).toHaveText('View Insights')

      const row2 = migrationPage.migrationResultsRow(2)
      await expect(row2.getByTestId('migration-id')).toHaveText('2026-10-29T11:00:35')
      await expect(row2.getByTestId('whenStarted')).toHaveText('29 October 2026 - 11:00')
      await expect(row2.getByTestId('whenEnded')).toHaveText('29 October 2026 - 11:00')
      await expect(row2.getByTestId('status')).toHaveText('COMPLETED')
      await expect(row2.getByTestId('migratedCount')).toHaveText('0')
      await expect(row2.getByTestId('failedCount')).toHaveText('4')
      await expect(row2.getByTestId('estimatedCount')).toHaveText('4')
      await expect(row2.getByTestId('progress-link')).toBeHidden()
      await expect(row2.getByTestId('failures-link')).toHaveText('View failures')
      await expect(row2.getByTestId('already-migrated-link')).toBeHidden()

      await row1.getByTestId('failures-link').click()
      await MigrationFailuresPage.verifyOnPage(migrationTypeName, page)
    })
  })

  test.describe('Without MIGRATE_NOMIS_SYSCON role', () => {
    test.beforeEach(async ({ page }) => {
      await nomisMigrationApi.stubGetMigrationHistory({ migrationType })
      await login(page, { roles: ['ROLE_MIGRATE_SOMETHING_ELSE'] })
    })

    test('should not see migrate scheduled payments tile', async ({ page }) => {
      const indexPage = await IndexPage.verifyOnPage(page)
      await expect(indexPage.migrationLink(migrationTypeName)).toBeHidden()
    })

    test('should not be able to navigate directly to the scheduled payments migration page', async ({ page }) => {
      await page.goto(migrationUrl)
      await AuthErrorPage.verifyOnPage(page)
    })
  })

  test('can start a scheduled payments migration', async ({ page }) => {
    const migrationId = '2026-10-29T12:00:00'
    await nomisMigrationApi.stubGetMigrationHistory({ migrationType, history: scheduledPaymentsMigrationHistory })
    await login(page)

    const indexPage = await IndexPage.verifyOnPage(page)
    await expect(indexPage.migrationLink(migrationTypeName)).toBeVisible()
    await indexPage.migrationLink(migrationTypeName).click()

    const migrationPage = await MigrationPage.verifyOnPage(migrationTypeName, page)
    await migrationPage.startNewMigration.click()
    await nomisPrisonerApi.stubGetScheduledPaymentsMigrationEstimatedCount(120)
    await nomisMigrationApi.stubGetFailureCountWithMigrationType({ migrationType, failures: 0 })
    await nomisMigrationApi.stubStartMigration({
      domain: 'scheduled-payments',
      response: {
        migrationId,
        estimatedCount: 120,
        type: migrationType,
      },
    })

    const startPage = await StartMigrationPage.verifyOnPage(migrationTypeName, page)
    await startPage.continueButton.click()
    const previewPage = await StartMigrationPreviewPage.verifyOnPage(migrationTypeName, page)
    await expect(previewPage.estimateSummary).toHaveText(
      'Estimated number of Scheduled payments entities to be migrated: 120',
    )
    await previewPage.startMigrationButton.click()

    const confirmationPage = await StartMigrationConfirmationPage.verifyOnPage(migrationTypeName, page)
    await expect(confirmationPage.confirmationMessage).toContainText('120')
    await expect(confirmationPage.confirmationMessage).toContainText(migrationId)
    await expect(confirmationPage.detailsLink).toHaveAttribute(
      'href',
      `${migrationUrl}/details?migrationId=${migrationId}`,
    )
  })
})
