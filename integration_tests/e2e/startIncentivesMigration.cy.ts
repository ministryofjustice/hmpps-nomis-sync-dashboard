import IndexPage from '../pages/index'
import Page from '../pages/page'
import StartIncentivesMigrationPage from '../pages/incentives-migration/startIncentivesMigration'
import StartIncentivesMigrationConfirmationPage from '../pages/incentives-migration/startIncentivesMigrationConfirmation'
import StartIncentivesMigrationPreviewPage from '../pages/incentives-migration/startIncentivesMigrationPreview'

import IncentivesMigrationPage from '../pages/incentives-migration/incentivesMigration'

context('Start Incentives Migration', () => {
  beforeEach(() => {
    cy.task('reset')
    cy.task('stubAuthUser')
  })
  context('With MIGRATE_INCENTIVES role', () => {
    beforeEach(() => {
      cy.task('stubSignIn', ['ROLE_MIGRATE_INCENTIVES'])
      cy.task('stubListOfIncentivesMigrationHistory')
      cy.signIn()
      const indexPage = Page.verifyOnPage(IndexPage)
      indexPage.incentivesMigrationLink().click()
    })
    it('can navigate to start migration page', () => {
      Page.verifyOnPage(IncentivesMigrationPage).startNewMigration().click()
      Page.verifyOnPage(StartIncentivesMigrationPage)
    })

    it('will validate page when selecting start migration', () => {
      Page.verifyOnPage(IncentivesMigrationPage).startNewMigration().click()
      const page = Page.verifyOnPage(StartIncentivesMigrationPage)
      page.fromDate().type('invalid')
      page.toDate().type('invalid')

      page.continueButton().click()

      const pageWithErrors = Page.verifyOnPage(StartIncentivesMigrationPage)
      pageWithErrors.errorSummary().contains('Enter a real date, like 2020-03-23')
    })
    it('Preview of migration will be shown and changes allowed prior to starting a migration', () => {
      cy.task('stubStartIncentivesMigration', {
        migrationId: '2022-03-23T11:11:56',
        estimatedCount: 100_988,
      })
      cy.task('stubHealth')
      cy.task('stubGetIncentivesFailures')

      Page.verifyOnPage(IncentivesMigrationPage).startNewMigration().click()
      cy.task('stubGetIncentiveMigrationEstimatedCount', 100_988)

      const page = Page.verifyOnPage(StartIncentivesMigrationPage)
      page.fromDate().type('2020-03-23')
      page.toDate().type('2020-03-30')

      page.continueButton().click()
      const previewPage = Page.verifyOnPage(StartIncentivesMigrationPreviewPage)
      previewPage.estimateSummary().contains('Estimated number of incentives to be migrated: 100,988')
      previewPage
        .dlqWarning()
        .contains(
          'There are 153 messages on the migration dead letter queue. Please clear these before starting the migration'
        )

      previewPage.fromDateRow().contains('2020-03-23')
      previewPage.fromDateChangeLink().click()

      // amend the from date
      const amendPage = Page.verifyOnPage(StartIncentivesMigrationPage)
      amendPage.fromDate().clear()
      amendPage.fromDate().type('2020-03-20')
      page.continueButton().click()

      // check amended date displayed
      const previewPageAgain = Page.verifyOnPage(StartIncentivesMigrationPreviewPage)
      previewPageAgain.fromDateRow().contains('2020-03-20')
      previewPageAgain.startMigrationButton().click()

      const confirmationPage = Page.verifyOnPage(StartIncentivesMigrationConfirmationPage)
      confirmationPage.confirmationMessage().contains('100,988')
      confirmationPage.confirmationMessage().contains('2022-03-23T11:11:56')
      confirmationPage.detailsLink().contains('View migration status')
    })

    it('Can clear DLQ when there are message still present', () => {
      cy.task('stubStartIncentivesMigration', {
        migrationId: '2022-03-23T11:11:56',
        estimatedCount: 100_988,
      })
      cy.task('stubHealth')
      cy.task('stubGetIncentivesFailures')
      cy.task('stubDeleteIncentivesFailures')

      Page.verifyOnPage(IncentivesMigrationPage).startNewMigration().click()
      cy.task('stubGetIncentiveMigrationEstimatedCount', 100_988)

      const page = Page.verifyOnPage(StartIncentivesMigrationPage)
      page.fromDate().type('2020-03-23')
      page.toDate().type('2020-03-30')

      page.continueButton().click()
      const previewPage = Page.verifyOnPage(StartIncentivesMigrationPreviewPage)
      previewPage.estimateSummary().contains('Estimated number of incentives to be migrated: 100,988')
      previewPage
        .dlqWarning()
        .contains(
          'There are 153 messages on the migration dead letter queue. Please clear these before starting the migration'
        )

      previewPage.clearDlqMessages().click()

      const previewPageAgain = Page.verifyOnPage(StartIncentivesMigrationPreviewPage)
      previewPageAgain.startMigrationButton().click()

      Page.verifyOnPage(StartIncentivesMigrationConfirmationPage)
    })
  })
})
