import { expect, Page, test } from '@playwright/test'

import { login, resetStubs } from '../../testUtils'

import nomisMigrationApi from '../../mockApis/nomisMigrationApi'
import IndexPage from '../../pages/indexPage'
import MigrationPage from '../../pages/migrationPage'
import StartMigrationPage from '../../pages/startMigrationPage'
import nomisPrisonerApi from '../../mockApis/nomisPrisonerApi'
import StartMigrationPreviewPage from '../../pages/startMigrationPreviewPage'
import StartMigrationConfirmationPage from '../../pages/startMigrationConfirmationPage'
import nomisActivitiesMigrationApi, {
  activitiesFailures,
  activitiesMigrationHistory,
} from '../../mockApis/nomisActivitiesMigrationApi'
import activitiesApi from '../../mockApis/activitiesApi'

const migrationType: string = 'ACTIVITIES'
const migrationTypeName: string = 'Activities'

test.describe('Activities Migration Start', () => {
  test.afterEach(async () => {
    await resetStubs()
  })
  test.describe('With MIGRATE_ACTIVITIES role', () => {
    test.beforeEach(async ({ page }) => {
      await login(page, { roles: ['ROLE_MIGRATE_ACTIVITIES'] })
      const indexPage = await IndexPage.verifyOnPage(page)
      await nomisMigrationApi.stubGetMigrationHistory({ migrationType, history: activitiesMigrationHistory })
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
      await startMigrationPage.prisonId.clear()
      await startMigrationPage.getField('courseActivityId').fill('invalid')

      await startMigrationPage.continueButton.click()

      const pageWithErrors = await StartMigrationPage.verifyOnPage(migrationTypeName, page)
      await expect(pageWithErrors.errorSummary.nth(0)).toHaveText('Enter a prison ID.')
      await expect(pageWithErrors.errorSummary.nth(1)).toHaveText('The Course Activity ID must be an integer.')
    })

    test('Preview of migration will be shown and changes allowed prior to starting a migration', async ({ page }) => {
      await nomisActivitiesMigrationApi.stubStartActivitiesMigration({
        migrationId: '2022-03-23T11:11:56',
        estimatedCount: 100_988,
      })
      await nomisMigrationApi.stubGetFailureCountWithMigrationType({ migrationType })
      await nomisMigrationApi.stubGetFailuresWithMigrationType({ migrationType, failures: activitiesFailures })

      const migrationPage = await MigrationPage.verifyOnPage(migrationTypeName, page)
      await migrationPage.startNewMigration.click()

      await nomisPrisonerApi.stubGetActivitiesMigrationEstimatedCount(100_988)

      const startMigrationPage = await StartMigrationPage.verifyOnPage(migrationTypeName, page)
      await startMigrationPage.getField('prisonId').fill('MDI')
      await startMigrationPage.getField('courseActivityId').fill('123456')
      await startMigrationPage.continueButton.click()

      const previewPage = await StartMigrationPreviewPage.verifyOnPage(migrationTypeName, page)
      await expect(previewPage.getFieldRow('prison-id')).toContainText('MDI')
      await expect(previewPage.getFieldRow('course-activity-id')).toContainText('123456')
      await previewPage.getChangeLink('prison-id').click()

      // amend the from date
      const amendPage = await StartMigrationPage.verifyOnPage(migrationTypeName, page)
      await amendPage.prisonId.clear()
      await amendPage.prisonId.fill('LEI')
      await amendPage.getField('courseActivityId').clear()
      await amendPage.getField('courseActivityId').fill('333333')
      await amendPage.continueButton.click()

      // check amended date displayed
      const previewPageAgain = await StartMigrationPreviewPage.verifyOnPage(migrationTypeName, page)
      await expect(previewPage.getFieldRow('prison-id')).toContainText('LEI')
      await expect(previewPage.getFieldRow('course-activity-id')).toContainText('333333')
      await previewPageAgain.startMigrationButton.click()

      const confirmationPage = await StartMigrationConfirmationPage.verifyOnPage(migrationTypeName, page)
      await expect(confirmationPage.confirmationMessage).toContainText('100,988')
      await expect(confirmationPage.confirmationMessage).toContainText('2022-03-23T11:11:56')
      await expect(confirmationPage.detailsLink).toHaveText('View migration status')
    })

    test('Can clear DLQ when there are message still present', async ({ page }) => {
      await nomisActivitiesMigrationApi.stubStartActivitiesMigration({
        migrationId: '2022-03-23T11:11:56',
        estimatedCount: 100_988,
      })
      await nomisMigrationApi.stubGetFailureCountWithMigrationType({ migrationType })
      await nomisMigrationApi.stubGetFailuresWithMigrationType({ migrationType, failures: activitiesFailures })
      await nomisMigrationApi.stubDeleteFailuresWithMigrationType({ migrationType })

      const migrationPage = await MigrationPage.verifyOnPage(migrationTypeName, page)
      await migrationPage.startNewMigration.click()
      await nomisPrisonerApi.stubGetActivitiesMigrationEstimatedCount(100_988)

      const startMigrationPage = await StartMigrationPage.verifyOnPage(migrationTypeName, page)
      await startMigrationPage.prisonId.fill('MDI')
      await startMigrationPage.continueButton.click()

      const previewPage = await StartMigrationPreviewPage.verifyOnPage(migrationTypeName, page)
      await expect(previewPage.estimateSummary).toHaveText(
        'Estimated number of Activities entities to be migrated: 100,988.',
      )
      await expect(previewPage.dlqWarning).toHaveText(
        'There are 153 messages on the migration dead letter queue. Please clear these before starting the migration',
      )
      await previewPage.clearDlqMessages.click()

      const previewPageAgain = await StartMigrationPreviewPage.verifyOnPage(migrationTypeName, page)
      await previewPageAgain.startMigrationButton.click()
      await StartMigrationConfirmationPage.verifyOnPage(migrationTypeName, page)
    })

    test('Shows successful preview check details', async ({ page }) => {
      setupPreviewPage(page)
      await expect(page.locator('#estimateSummary')).toHaveText(
        'Estimated number of Activities entities to be migrated: 100,988.',
      )
      await expect(page.locator('#incentiveLevels')).toContainText('BAS,STD,ENH')
      await expect(page.locator('#nomisFeatureSwitch')).toBeHidden()
      await expect(page.locator('#activateFeatureSwitch')).toBeHidden()
      await expect(page.locator('#dpsFeatureSwitch')).toBeVisible()
      await expect(page.locator('#dpsPayBands')).toBeVisible()
      await expect(page.locator('#dpsPrisonRegime')).toBeVisible()
      await expect(page.locator('#nomisSuspendedAllocations')).toBeVisible()
      await expect(page.locator('#nomisAllocationsMissingPayBands')).toBeVisible()
      await expect(page.locator('#nomisPayRatesUnknownIncentive')).toBeVisible()
    })

    test('Shows errors returned from preview checks', async ({ page }) => {
      await nomisActivitiesMigrationApi.stubStartActivitiesMigration({
        migrationId: '2022-03-23T11:11:56',
        estimatedCount: 100_988,
      })
      await nomisMigrationApi.stubGetFailureCountWithMigrationType({ migrationType, failures: 0 })
      await nomisMigrationApi.stubGetNoFailuresWithMigrationType({ migrationType })

      const migrationPage = await MigrationPage.verifyOnPage(migrationTypeName, page)
      await migrationPage.startNewMigration.click()

      await nomisPrisonerApi.stubGetActivitiesMigrationEstimatedCount(100_988)
      await nomisPrisonerApi.stubCheckServiceAgencySwitchErrors('ACTIVITY')
      await nomisPrisonerApi.stubGetPrisonIncentiveLevelsErrors()
      await activitiesApi.stubGetDpsPrisonRolloutErrors()
      await activitiesApi.stubGetDpsPayBandsErrors()
      await activitiesApi.stubGetDpsPrisonRegimeErrors()
      await nomisPrisonerApi.stubFindSuspendedAllocationsErrors()
      await nomisPrisonerApi.stubFindAllocationsWithMissingPayBandsErrors()
      await nomisPrisonerApi.stubFindPayRatesWithUnknownIncentiveErrors()
      await nomisPrisonerApi.stubFindActivitiesWithoutScheduleRulesErrors()

      const startMigrationPage = await StartMigrationPage.verifyOnPage(migrationTypeName, page)
      await startMigrationPage.getField('prisonId').fill('MDI')
      await startMigrationPage.continueButton.click()

      const previewPage = await StartMigrationPreviewPage.verifyOnPage(migrationTypeName, page)
      await expect(previewPage.errorSummary).toContainText(['Failed to check incentive levels'])
      await expect(previewPage.errorSummary).toContainText(['Failed to check if ACTIVITY feature switch turned on'])
      await expect(previewPage.errorSummary).toContainText(['Failed to check if prison MDI is switched on in DPS'])
      await expect(previewPage.errorSummary).toContainText(['Failed to check if prison MDI has pay bands in DPS'])
      await expect(previewPage.errorSummary).toContainText([
        'Failed to check if prison MDI has slot times configured in DPS',
      ])
      await expect(previewPage.errorSummary).toContainText(['Failed to find suspended allocations'])
      await expect(previewPage.errorSummary).toContainText(['Failed to find allocations with missing pay bands'])
      await expect(previewPage.errorSummary).toContainText(['Failed to find activities without schedule rules'])
      await expect(page.locator('#nomisFeatureSwitch')).toBeHidden()
      await expect(page.locator('#activateFeatureSwitch')).toBeHidden()
      await expect(page.locator('#dpsFeatureSwitch')).toBeHidden()
      await expect(page.locator('#dpsPayBands')).toBeHidden()
      await expect(page.locator('#dpsPrisonRegime')).toBeHidden()
      await expect(page.locator('#nomisSuspendedAllocations')).toBeHidden()
      await expect(page.locator('#nomisAllocationsMissingPayBands')).toBeHidden()
      await expect(page.locator('#nomisPayRatesUnknownIncentive')).toBeHidden()
      await expect(page.locator('#activitiesWithoutScheduleRules')).toBeHidden()
    })

    test('Turns on NOMIS feature switch if not already active', async ({ page }) => {
      await nomisActivitiesMigrationApi.stubStartActivitiesMigration({
        migrationId: '2022-03-23T11:11:56',
        estimatedCount: 100_988,
      })
      await nomisMigrationApi.stubGetFailureCountWithMigrationType({ migrationType })
      await nomisMigrationApi.stubGetNoFailuresWithMigrationType({ migrationType })

      const migrationPage = await MigrationPage.verifyOnPage(migrationTypeName, page)
      await migrationPage.startNewMigration.click()

      await nomisPrisonerApi.stubGetActivitiesMigrationEstimatedCount(100_988)
      await nomisPrisonerApi.stubGetPrisonIncentiveLevels()
      await activitiesApi.stubGetDpsPrisonRollout()
      await activitiesApi.stubGetDpsPayBands()
      await activitiesApi.stubGetDpsPrisonRegime()
      await nomisPrisonerApi.stubFindSuspendedAllocations()
      await nomisPrisonerApi.stubFindAllocationsWithMissingPayBands()
      await nomisPrisonerApi.stubFindPayRatesWithUnknownIncentive()
      await nomisPrisonerApi.stubFindActivitiesWithoutScheduleRules()
      await nomisPrisonerApi.stubCheckServiceAgencySwitchNotFound('ACTIVITY')
      await nomisPrisonerApi.stubPostServiceAgencySwitch()
      await nomisPrisonerApi.stubCheckServiceAgencySwitchAfterNotFound('ACTIVITY')

      const startMigrationPage = await StartMigrationPage.verifyOnPage(migrationTypeName, page)
      await startMigrationPage.getField('prisonId').fill('MDI')
      await startMigrationPage.continueButton.click()

      await StartMigrationPreviewPage.verifyOnPage(migrationTypeName, page)
      await expect(page.locator('#nomisFeatureSwitch')).toBeVisible()
      await page.getByTestId('activate-prison-button').click()

      const amendPage = await StartMigrationPage.verifyOnPage(migrationTypeName, page)
      await amendPage.continueButton.click()

      await StartMigrationPreviewPage.verifyOnPage(migrationTypeName, page)
      await expect(page.locator('#nomisFeatureSwitch')).toBeHidden()
      await expect(page.getByTestId('activate-prison-button')).toBeHidden()
    })

    async function setupPreviewPage(page: Page): Promise<StartMigrationPreviewPage> {
      await nomisActivitiesMigrationApi.stubStartActivitiesMigration({
        migrationId: '2022-03-23T11:11:56',
        estimatedCount: 100_988,
      })
      await nomisMigrationApi.stubGetFailureCountWithMigrationType({ migrationType })
      await nomisMigrationApi.stubGetNoFailuresWithMigrationType({ migrationType })

      const migrationPage = await MigrationPage.verifyOnPage(migrationTypeName, page)
      await migrationPage.startNewMigration.click()

      await nomisPrisonerApi.stubGetActivitiesMigrationEstimatedCount(100_988)
      await nomisPrisonerApi.stubCheckServiceAgencySwitch('ACTIVITY')
      await nomisPrisonerApi.stubGetPrisonIncentiveLevels()
      await activitiesApi.stubGetDpsPrisonRollout()
      await activitiesApi.stubGetDpsPayBands()
      await activitiesApi.stubGetDpsPrisonRegime()
      await nomisPrisonerApi.stubFindSuspendedAllocations()
      await nomisPrisonerApi.stubFindAllocationsWithMissingPayBands()
      await nomisPrisonerApi.stubFindPayRatesWithUnknownIncentive()
      await nomisPrisonerApi.stubFindActivitiesWithoutScheduleRules()

      const startMigrationPage = await StartMigrationPage.verifyOnPage(migrationTypeName, page)
      await startMigrationPage.getField('prisonId').fill('MDI')
      await startMigrationPage.continueButton.click()

      return StartMigrationPreviewPage.verifyOnPage(migrationTypeName, page)
    }

    test('Should allow copy of suspended activities', async ({ page }) => {
      const previewPage = await setupPreviewPage(page)

      await previewPage.testCopyToClipboard(
        'nomisSuspendedAllocations',
        'Activity Description, Activity ID, Prisoner Number,\n    Kitchens AM, 12345, A1234AA,',
      )
    })

    test('Should allow copy of allocations missing pay bands', async ({ page }) => {
      const previewPage = await setupPreviewPage(page)

      await previewPage.testCopyToClipboard(
        'nomisAllocationsMissingPayBands',
        'Activity Description, Activity ID, Prisoner Number, Incentive Level,\n    Kitchens AM, 12345, A1234AA, STD,',
      )
    })

    test('Should allow copy of pay rates unknown incentive', async ({ page }) => {
      const previewPage = await setupPreviewPage(page)

      await previewPage.testCopyToClipboard(
        'nomisPayRatesUnknownIncentive',
        'Activity Description, Activity ID, Pay Band Code, Incentive Level,\n    Kitchens AM, 12345, 5, undefined,',
      )
    })

    test('Should allow copy of activities without schedule rules', async ({ page }) => {
      const previewPage = await setupPreviewPage(page)

      await previewPage.testCopyToClipboard(
        'nomisActivitiesWithoutScheduleRules',
        'Activity Description, Activity ID,\n    Kitchens AM, 12345,',
      )
    })
  })
})
