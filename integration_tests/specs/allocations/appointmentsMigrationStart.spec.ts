import { expect, Page, test } from '@playwright/test'

import { login, resetStubs } from '../../testUtils'

import nomisMigrationApi from '../../mockApis/nomisMigrationApi'
import IndexPage from '../../pages/indexPage'
import MigrationPage from '../../pages/migrationPage'
import StartMigrationPage from '../../pages/startMigrationPage'
import nomisPrisonerApi from '../../mockApis/nomisPrisonerApi'
import StartMigrationPreviewPage from '../../pages/startMigrationPreviewPage'
import StartMigrationConfirmationPage from '../../pages/startMigrationConfirmationPage'
import nomisAppointmentsMigrationApi, {
  appointmentsFailures,
  appointmentsMigrationHistory,
} from '../../mockApis/nomisAppointmentsMigrationApi'

const migrationType: string = 'APPOINTMENTS'
const migrationTypeName: string = 'Appointments'

test.describe('Appointments Migration Start', () => {
  test.afterEach(async () => {
    await resetStubs()
  })
  test.describe('With MIGRATE_APPOINTMENTS role', () => {
    test.beforeEach(async ({ page }) => {
      await login(page, { roles: ['ROLE_MIGRATE_APPOINTMENTS'] })
      const indexPage = await IndexPage.verifyOnPage(page)
      await nomisMigrationApi.stubGetMigrationHistory({ migrationType, history: appointmentsMigrationHistory })
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
      await startMigrationPage.getField('prisonIds').clear()
      await startMigrationPage.getField('fromDate').fill('invalid')
      await startMigrationPage.getField('toDate').fill('invalid')
      await startMigrationPage.continueButton.click()

      const pageWithErrors = await StartMigrationPage.verifyOnPage(migrationTypeName, page)
      await expect(pageWithErrors.errorSummary.nth(0)).toHaveText('Enter one or more prison IDs')
      await expect(pageWithErrors.errorSummary.nth(1)).toHaveText('Enter a real date, like 2020-03-23')
      await expect(pageWithErrors.errorSummary.nth(2)).toHaveText('Enter a real date, like 2020-03-23')
    })

    async function setupPreviewPage(page: Page): Promise<StartMigrationPreviewPage> {
      await nomisAppointmentsMigrationApi.stubStartAppointmentsMigration({
        migrationId: '2022-03-23T11:11:56',
        estimatedCount: 100_988,
      })

      await nomisMigrationApi.stubGetFailureCountWithMigrationType({ migrationType })
      await nomisMigrationApi.stubGetFailuresWithMigrationType({ migrationType, failures: appointmentsFailures })
      await nomisPrisonerApi.stubCheckServiceAgencySwitch(migrationType)
      await nomisPrisonerApi.stubGetAppointmentCounts()
      const migrationPage = await MigrationPage.verifyOnPage(migrationTypeName, page)
      await migrationPage.startNewMigration.click()

      await nomisPrisonerApi.stubGetAppointmentsMigrationEstimatedCount(100_988)

      const startMigrationPage = await StartMigrationPage.verifyOnPage(migrationTypeName, page)
      await startMigrationPage.getField('prisonIds').fill('HEI')
      await startMigrationPage.getField('fromDate').fill('2020-03-23')
      await startMigrationPage.getField('toDate').fill('2020-03-30')
      await startMigrationPage.continueButton.click()

      return StartMigrationPreviewPage.verifyOnPage(migrationTypeName, page)
    }

    test('Preview of migration will be shown and changes allowed prior to starting a migration', async ({ page }) => {
      const previewPage = await setupPreviewPage(page)
      await expect(previewPage.estimateSummary).toHaveText(
        'Estimated number of Appointments entities to be migrated: 100,988',
      )

      await expect(previewPage.dlqWarning).toHaveText(
        'There are 153 messages on the migration dead letter queue. Please clear these before starting the migration',
      )

      await expect(previewPage.getFieldRow('prison-codes')).toContainText('HEI')
      await expect(previewPage.getFieldRow('created-after')).toContainText('2020-03-23')
      await expect(previewPage.getFieldRow('created-before')).toContainText('2020-03-30')
      await expect(page.getByTestId('activate-prison-button-HEI')).toBeHidden()
      await expect(page.locator('#nomisAppointmentCounts')).toBeVisible()
      await previewPage.getChangeLink('created-after').click()

      // amend the from date
      const amendPage = await StartMigrationPage.verifyOnPage(migrationTypeName, page)
      await amendPage.getField('fromDate').clear()
      await amendPage.getField('fromDate').fill('2020-03-20')
      await amendPage.continueButton.click()

      // check amended date displayed
      const previewPageAgain = await StartMigrationPreviewPage.verifyOnPage(migrationTypeName, page)
      await expect(previewPageAgain.getFieldRow('created-after')).toContainText('2020-03-20')
      await previewPageAgain.startMigrationButton.click()

      const confirmationPage = await StartMigrationConfirmationPage.verifyOnPage(migrationTypeName, page)
      await expect(confirmationPage.confirmationMessage).toContainText('100,988')
      await expect(confirmationPage.confirmationMessage).toContainText('2022-03-23T11:11:56')
      await expect(confirmationPage.detailsLink).toHaveText('View migration status')
    })

    test('Can clear DLQ when there are message still present', async ({ page }) => {
      await nomisAppointmentsMigrationApi.stubStartAppointmentsMigration({
        migrationId: '2022-03-23T11:11:56',
        estimatedCount: 100_988,
      })
      await nomisMigrationApi.stubGetFailureCountWithMigrationType({ migrationType })
      await nomisMigrationApi.stubGetFailuresWithMigrationType({ migrationType, failures: appointmentsFailures })
      await nomisMigrationApi.stubDeleteFailuresWithMigrationType({ migrationType })

      const migrationPage = await MigrationPage.verifyOnPage(migrationTypeName, page)
      await migrationPage.startNewMigration.click()
      await nomisPrisonerApi.stubGetAppointmentsMigrationEstimatedCount(100_988)
      await nomisPrisonerApi.stubGetAppointmentCounts()

      const startMigrationPage = await StartMigrationPage.verifyOnPage(migrationTypeName, page)
      await startMigrationPage.getField('prisonIds').fill('HEI')
      await startMigrationPage.getField('fromDate').fill('2020-03-23')
      await startMigrationPage.getField('fromDate').fill('2020-03-30')
      await startMigrationPage.continueButton.click()

      const previewPage = await StartMigrationPreviewPage.verifyOnPage(migrationTypeName, page)
      await expect(previewPage.estimateSummary).toHaveText(
        'Estimated number of Appointments entities to be migrated: 100,988',
      )
      await expect(previewPage.dlqWarning).toHaveText(
        'There are 153 messages on the migration dead letter queue. Please clear these before starting the migration',
      )
      await previewPage.clearDlqMessages.click()

      const previewPageAgain = await StartMigrationPreviewPage.verifyOnPage(migrationTypeName, page)
      await previewPageAgain.startMigrationButton.click()
      await StartMigrationConfirmationPage.verifyOnPage(migrationTypeName, page)
    })

    test('Turns on NOMIS feature switch if not already active', async ({ page }) => {
      await nomisAppointmentsMigrationApi.stubStartAppointmentsMigration({
        migrationId: '2022-03-23T11:11:56',
        estimatedCount: 100_988,
      })
      await nomisMigrationApi.stubGetFailureCountWithMigrationType({ migrationType })
      await nomisMigrationApi.stubGetFailuresWithMigrationType({ migrationType, failures: appointmentsFailures })
      await nomisMigrationApi.stubDeleteFailuresWithMigrationType({ migrationType })
      await nomisPrisonerApi.stubCheckServiceAgencySwitchNotFound(migrationType)
      await nomisPrisonerApi.stubCheckServiceAgencySwitchAfterNotFound(migrationType)

      const migrationPage = await MigrationPage.verifyOnPage(migrationTypeName, page)
      await migrationPage.startNewMigration.click()

      await nomisPrisonerApi.stubGetAppointmentsMigrationEstimatedCount(100_988)
      await nomisPrisonerApi.stubGetAppointmentCounts()

      const startMigrationPage = await StartMigrationPage.verifyOnPage(migrationTypeName, page)
      await startMigrationPage.getField('prisonIds').fill('HEI')
      await startMigrationPage.getField('fromDate').fill('2020-03-23')
      await startMigrationPage.getField('toDate').fill('2020-03-30')
      await startMigrationPage.continueButton.click()

      await StartMigrationPreviewPage.verifyOnPage(migrationTypeName, page)
      await page.getByTestId('activate-prison-button-HEI').click()

      const amendPage = await StartMigrationPage.verifyOnPage(migrationTypeName, page)
      await amendPage.continueButton.click()

      await StartMigrationPreviewPage.verifyOnPage(migrationTypeName, page)
      await expect(page.getByTestId('activate-prison-button-HEI')).toBeHidden()
    })

    test('Should allow copy of APPOINTMENTS missing pay bands', async ({ page }) => {
      await setupPreviewPage(page)
      await expect(page.locator('#copy-appointment-counts-confirmed')).toContainClass('govuk-visually-hidden')
      await expect(page.locator('#copy-appointment-counts-failed')).toContainClass('govuk-visually-hidden')
      await page.locator('#nomisAppointmentCounts').getByRole('link').click()

      const clipboardContent = await page.evaluate(() => navigator.clipboard.readText())
      expect(clipboardContent).toEqual('Prison, Event Sub Type, Future appointment?, Count,\n    MSI, ACCA, false, 20,')
      await expect(page.locator('#copy-appointment-counts-confirmed')).not.toContainClass('govuk-visually-hidden')
    })
  })
})
