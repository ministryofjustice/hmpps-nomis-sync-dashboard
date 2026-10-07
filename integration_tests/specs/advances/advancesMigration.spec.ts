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
import AuthErrorPage from '../../pages/authErrorPage'
import MigrationFailuresPage from '../../pages/migrationFailuresPage'

const migrationType = 'PRISONER_ADVANCES'
const migrationTypeName = 'Advances'

test.describe('Advances migration', () => {
  test.afterEach(async () => {
    await resetStubs()
  })

  test.describe('With MIGRATE_NOMIS_SYSCON role', () => {
    test.beforeEach(async ({ page }) => {
      await nomisMigrationApi.stubGetMigrationHistory({ migrationType, history: prisonerAdvancesMigrationHistory })
      await login(page)
    })

    test('should see migrate advances tile', async ({ page }) => {
      const indexPage = await IndexPage.verifyOnPage(page)
      await expect(indexPage.migrationLink(migrationTypeName)).toBeVisible()
    })

    test('should be able to navigate to the advances migration home page', async ({ page }) => {
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
      await expect(row0.getByTestId('migration-id')).toHaveText('2026-10-01T10:13:56')
      await expect(row0.getByTestId('whenStarted')).toHaveText('1 October 2026 - 10:13')
      await expect(row0.getByTestId('whenEnded')).toHaveText('1 October 2026 - 10:14')
      await expect(row0.getByTestId('status')).toHaveText('COMPLETED')
      await expect(row0.getByTestId('migratedCount')).toHaveText('0')
      await expect(row0.getByTestId('failedCount')).toHaveText('0')
      await expect(row0.getByTestId('estimatedCount')).toHaveText('0')
      await expect(row0.getByTestId('progress-link')).toBeHidden()
      await expect(row0.getByTestId('failures-link')).toBeHidden()
      await expect(row0.getByTestId('already-migrated-link')).toBeHidden()

      const row1 = migrationPage.migrationResultsRow(1)
      await expect(row1.getByTestId('migration-id')).toHaveText('2026-10-02T11:45:12')
      await expect(row1.getByTestId('whenStarted')).toHaveText('2 October 2026 - 11:45')
      await expect(row1.getByTestId('whenEnded')).toBeHidden()
      await expect(row1.getByTestId('status')).toHaveText('STARTED')
      await expect(row1.getByTestId('migratedCount')).toHaveText('1')
      await expect(row1.getByTestId('failedCount')).toHaveText('162')
      await expect(row1.getByTestId('estimatedCount')).toHaveText('205')
      await expect(row1.getByTestId('progress-link')).toHaveText('View progress')
      await expect(row1.getByTestId('progress-link')).toHaveAttribute(
        'href',
        '/advances-migration/details?migrationId=2026-10-02T11:45:12',
      )
      await expect(row1.getByTestId('failures-link')).toHaveText('View failures')
      await expect(row1.getByTestId('already-migrated-link')).toHaveText('View Insights')

      const row2 = migrationPage.migrationResultsRow(2)
      await expect(row2.getByTestId('migration-id')).toHaveText('2026-10-03T11:00:35')
      await expect(row2.getByTestId('whenStarted')).toHaveText('3 October 2026 - 11:00')
      await expect(row2.getByTestId('whenEnded')).toHaveText('3 October 2026 - 11:00')
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

    test('should not see migrate advances tile', async ({ page }) => {
      const indexPage = await IndexPage.verifyOnPage(page)
      await expect(indexPage.migrationLink(migrationTypeName)).toBeHidden()
    })

    test('should not be able to navigate directly to the advances migration page', async ({ page }) => {
      await page.goto('/advances-migration')
      await AuthErrorPage.verifyOnPage(page)
    })
  })

  test('can start an advances migration', async ({ page }) => {
    await nomisMigrationApi.stubGetMigrationHistory({ migrationType, history: prisonerAdvancesMigrationHistory })
    await login(page)

    const indexPage = await IndexPage.verifyOnPage(page)
    await expect(indexPage.migrationLink(migrationTypeName)).toBeVisible()
    await indexPage.migrationLink(migrationTypeName).click()

    const migrationPage = await MigrationPage.verifyOnPage(migrationTypeName, page)
    await migrationPage.startNewMigration.click()
    await nomisPrisonerApi.stubGetAdvancesMigrationEstimatedCount(120)
    await nomisMigrationApi.stubGetFailureCountWithMigrationType({ migrationType, failures: 0 })
    await nomisMigrationApi.stubStartMigration({
      domain: 'prisoner-advances',
      response: {
        migrationId: '2026-10-06T12:00:00',
        estimatedCount: 120,
        type: migrationType,
      },
    })

    const startPage = await StartMigrationPage.verifyOnPage(migrationTypeName, page)
    await startPage.continueButton.click()
    const previewPage = await StartMigrationPreviewPage.verifyOnPage(migrationTypeName, page)
    await expect(previewPage.estimateSummary).toHaveText('Estimated number of Advances entities to be migrated: 120')
    await previewPage.startMigrationButton.click()

    const confirmationPage = await StartMigrationConfirmationPage.verifyOnPage(migrationTypeName, page)
    await expect(confirmationPage.confirmationMessage).toContainText('120')
    await expect(confirmationPage.confirmationMessage).toContainText('2026-10-06T12:00:00')
    await expect(confirmationPage.detailsLink).toHaveAttribute(
      'href',
      '/advances-migration/details?migrationId=2026-10-06T12:00:00',
    )
  })
})
