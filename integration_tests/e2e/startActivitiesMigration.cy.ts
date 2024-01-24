import IndexPage from '../pages/index'
import Page from '../pages/page'
import StartActivitiesMigrationPage from '../pages/activities-migration/startActivitiesMigration'
import StartActivitiesMigrationConfirmationPage from '../pages/activities-migration/startActivitiesMigrationConfirmation'
import StartActivitiesMigrationPreviewPage from '../pages/activities-migration/startActivitiesMigrationPreview'
import ActivitiesMigrationPage from '../pages/activities-migration/activitiesMigration'

context('Start Activities Migration', () => {
  beforeEach(() => {
    cy.task('reset')
    cy.task('stubManageUser')
    cy.task('stubGetActivityCategories')
  })
  context('With MIGRATE_ACTIVITIES role', () => {
    beforeEach(() => {
      cy.task('stubSignIn', ['ROLE_MIGRATE_ACTIVITIES'])
      cy.task('stubListOfActivitiesMigrationHistory')
      cy.signIn()
      const indexPage = Page.verifyOnPage(IndexPage)
      indexPage.activitiesMigrationLink().click()
    })
    it('can navigate to start migration page', () => {
      Page.verifyOnPage(ActivitiesMigrationPage).startNewMigration().click()
      Page.verifyOnPage(StartActivitiesMigrationPage)
    })

    it('will validate page when selecting start migration', () => {
      Page.verifyOnPage(ActivitiesMigrationPage).startNewMigration().click()
      const page = Page.verifyOnPage(StartActivitiesMigrationPage)
      page.prisonId().clear()
      page.courseActivityId().type('invalid')

      page.continueButton().click()

      const pageWithErrors = Page.verifyOnPage(StartActivitiesMigrationPage)
      pageWithErrors.errorSummary().contains('Enter a prison ID')
      pageWithErrors.errorSummary().contains('The Course Activity ID must be an integer')
    })

    it('Preview of migration will be shown and changes allowed prior to starting a migration', () => {
      cy.task('stubStartActivitiesMigration', {
        migrationId: '2022-03-23T11:11:56',
        estimatedCount: 100_988,
      })
      cy.task('stubHealth', '0')
      cy.task('stubGetActivitiesWithFailures')

      Page.verifyOnPage(ActivitiesMigrationPage).startNewMigration().click()
      cy.task('stubGetActivitiesMigrationEstimatedCount', 100_988)

      const page = Page.verifyOnPage(StartActivitiesMigrationPage)
      page.prisonId().type('MDI')
      page.courseActivityId().type('123456')

      page.continueButton().click()
      const previewPage = Page.verifyOnPage(StartActivitiesMigrationPreviewPage)

      previewPage.prisonIdRow().contains('MDI')
      previewPage.courseActivityIdRow().contains('123456')
      previewPage.prisonIdChangeLink().click()

      // amend the from date
      const amendPage = Page.verifyOnPage(StartActivitiesMigrationPage)
      amendPage.prisonId().clear().type('LEI')
      amendPage.courseActivityId().clear().type('333333')
      page.continueButton().click()

      // check amended date displayed
      const previewPageAgain = Page.verifyOnPage(StartActivitiesMigrationPreviewPage)
      previewPageAgain.prisonIdRow().contains('LEI')
      previewPageAgain.courseActivityIdRow().contains('333333')
      previewPageAgain.startMigrationButton().click()

      const confirmationPage = Page.verifyOnPage(StartActivitiesMigrationConfirmationPage)
      confirmationPage.confirmationMessage().contains('100,988')
      confirmationPage.confirmationMessage().contains('2022-03-23T11:11:56')
      confirmationPage.detailsLink().contains('View migration status')
    })

    it('Can clear DLQ when there are message still present', () => {
      cy.task('stubStartActivitiesMigration', {
        migrationId: '2022-03-23T11:11:56',
        estimatedCount: 100_988,
      })
      cy.task('stubHealth', '153')
      cy.task('stubGetActivitiesWithFailures')
      cy.task('stubDeleteActivitiesFailures')

      Page.verifyOnPage(ActivitiesMigrationPage).startNewMigration().click()
      cy.task('stubGetActivitiesMigrationEstimatedCount', 100_988)

      const page = Page.verifyOnPage(StartActivitiesMigrationPage)
      page.prisonId().type('MDI')

      page.continueButton().click()
      const previewPage = Page.verifyOnPage(StartActivitiesMigrationPreviewPage)
      previewPage.estimateSummary().contains('Estimated number of Activities entities to be migrated: 100,988')
      previewPage
        .dlqWarning()
        .contains(
          'There are 153 messages on the migration dead letter queue. Please clear these before starting the migration',
        )

      previewPage.clearDlqMessages().click()

      const previewPageAgain = Page.verifyOnPage(StartActivitiesMigrationPreviewPage)
      previewPageAgain.startMigrationButton().click()

      Page.verifyOnPage(StartActivitiesMigrationConfirmationPage)
    })

    it('Shows successful preview check details', () => {
      cy.task('stubStartActivitiesMigration', {
        migrationId: '2022-03-23T11:11:56',
        estimatedCount: 100_988,
      })
      cy.task('stubHealth', '0')
      cy.task('stubGetActivitiesNoFailures')

      Page.verifyOnPage(ActivitiesMigrationPage).startNewMigration().click()
      cy.task('stubGetActivitiesMigrationEstimatedCount', 100_988)
      cy.task('stubCheckServiceAgencySwitch')
      cy.task('stubGetPrisonIncentiveLevels')
      cy.task('stubGetDpsPrisonRollout')
      cy.task('stubGetDpsPayBands')
      cy.task('stubGetDpsPrisonRegime')
      cy.task('stubFindSuspendedAllocations')
      cy.task('stubFindAllocationsWithMissingPayBands')

      const page = Page.verifyOnPage(StartActivitiesMigrationPage)
      page.prisonId().type('MDI')

      page.continueButton().click()
      const previewPage = Page.verifyOnPage(StartActivitiesMigrationPreviewPage)
      previewPage.estimateSummary().contains('Estimated number of Activities entities to be migrated: 100,988')
      previewPage.incentiveLevels().contains('BAS,STD,ENH')
      previewPage.nomisFeatureSwitch().should('not.exist')
      previewPage.activateFeatureSwitch().should('not.exist')
      previewPage.dpsFeatureSwitch().should('exist')
      previewPage.dpsPayBands().should('exist')
      previewPage.dpsPrisonRegime().should('exist')
      previewPage.nomisSuspendedAllocations().should('exist')
      previewPage.nomisAllocationsWithNoPayBands().should('exist')
    })

    it('Shows errors returned from preview checks', () => {
      cy.task('stubStartActivitiesMigration', {
        migrationId: '2022-03-23T11:11:56',
        estimatedCount: 100_988,
      })
      cy.task('stubHealth', '0')
      cy.task('stubGetActivitiesNoFailures')

      Page.verifyOnPage(ActivitiesMigrationPage).startNewMigration().click()
      cy.task('stubGetActivitiesMigrationEstimatedCount', 100_988)
      cy.task('stubCheckServiceAgencySwitchErrors')
      cy.task('stubGetPrisonIncentiveLevelsErrors')
      cy.task('stubGetDpsPrisonRolloutErrors')
      cy.task('stubGetDpsPayBandsErrors')
      cy.task('stubGetDpsPrisonRegimeErrors')
      cy.task('stubFindSuspendedAllocationsErrors')
      cy.task('stubFindAllocationsWithMissingPayBandsErrors')

      const page = Page.verifyOnPage(StartActivitiesMigrationPage)
      page.prisonId().type('MDI')
      page.continueButton().click()

      const previewPage = Page.verifyOnPage(StartActivitiesMigrationPreviewPage)
      previewPage.errorSummary().contains('Failed to check incentive levels')
      previewPage.errorSummary().contains('Failed to check if ACTIVITY feature switch turned on')
      previewPage.errorSummary().contains('Failed to check if prison MDI is switched on in DPS')
      previewPage.errorSummary().contains('Failed to check if prison MDI has pay bands in DPS')
      previewPage.errorSummary().contains('Failed to check if prison MDI has slot times configured in DPS')
      previewPage.errorSummary().contains('Failed to find suspended allocations')
      previewPage.errorSummary().contains('Failed to find allocations with missing pay bands')
      previewPage.nomisFeatureSwitch().should('not.exist')
      previewPage.activateFeatureSwitch().should('not.exist')
      previewPage.dpsFeatureSwitch().should('not.exist')
      previewPage.dpsPayBands().should('not.exist')
      previewPage.dpsPrisonRegime().should('not.exist')
      previewPage.nomisSuspendedAllocations().should('not.exist')
      previewPage.nomisAllocationsWithNoPayBands().should('not.exist')
    })

    it('Turns on NOMIS feature switch if not already active', () => {
      cy.task('stubStartActivitiesMigration', {
        migrationId: '2022-03-23T11:11:56',
        estimatedCount: 100_988,
      })
      cy.task('stubHealth', '0')
      cy.task('stubGetActivitiesNoFailures')

      Page.verifyOnPage(ActivitiesMigrationPage).startNewMigration().click()
      cy.task('stubGetActivitiesMigrationEstimatedCount', 100_988)
      cy.task('stubGetPrisonIncentiveLevels')
      cy.task('stubGetDpsPrisonRollout')
      cy.task('stubGetDpsPayBands')
      cy.task('stubGetDpsPrisonRegime')
      cy.task('stubFindSuspendedAllocations')
      cy.task('stubFindAllocationsWithMissingPayBands')
      cy.task('stubCheckServiceAgencySwitchNotFound')
      cy.task('stubPostServiceAgencySwitch')
      cy.task('stubCheckServiceAgencySwitchAfterNotFound')

      const page = Page.verifyOnPage(StartActivitiesMigrationPage)
      page.prisonId().type('MDI')
      page.continueButton().click()

      const previewPage = Page.verifyOnPage(StartActivitiesMigrationPreviewPage)
      previewPage.nomisFeatureSwitch().should('exist')
      previewPage.activateFeatureSwitch().should('exist')
      previewPage.activateFeatureSwitch().click()

      const amendPage = Page.verifyOnPage(StartActivitiesMigrationPage)
      amendPage.continueButton().click()
      Page.verifyOnPage(StartActivitiesMigrationPreviewPage)
      previewPage.nomisFeatureSwitch().should('not.exist')
    })
  })
})
