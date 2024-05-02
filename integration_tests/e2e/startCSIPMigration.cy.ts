import IndexPage from '../pages/index'
import Page from '../pages/page'
import StartCSIPMigrationPage from '../pages/csip-migration/startCSIPMigration'
import StartCSIPMigrationConfirmationPage from '../pages/csip-migration/startCSIPMigrationConfirmation'
import StartCSIPMigrationPreviewPage from '../pages/csip-migration/startCSIPMigrationPreview'

import CSIPMigrationPage from '../pages/csip-migration/csipMigration'

context('Start CSIP Migration', () => {
  beforeEach(() => {
    cy.task('reset')
    cy.task('stubManageUser')
  })
  context('With MIGRATE_CSIP role', () => {
    beforeEach(() => {
      cy.task('stubSignIn', ['ROLE_MIGRATE_CSIP'])
      cy.task('stubListOfCSIPMigrationHistory')
      cy.signIn()
      const indexPage = Page.verifyOnPage(IndexPage)
      indexPage.csipMigrationLink().click()
    })
    it('can navigate to start migration page', () => {
      Page.verifyOnPage(CSIPMigrationPage).startNewMigration().click()
      Page.verifyOnPage(StartCSIPMigrationPage)
    })

    it('will validate page when selecting start migration', () => {
      Page.verifyOnPage(CSIPMigrationPage).startNewMigration().click()
      const page = Page.verifyOnPage(StartCSIPMigrationPage)
      page.fromDate().type('invalid')
      page.toDate().type('invalid')

      page.continueButton().click()

      const pageWithErrors = Page.verifyOnPage(StartCSIPMigrationPage)
      pageWithErrors.errorSummary().contains('Enter a real date, like 2020-03-23')
    })
    it('Preview of migration will be shown and changes allowed prior to starting a migration', () => {
      cy.task('stubStartCSIPMigration', {
        migrationId: '2022-03-23T11:11:56',
        estimatedCount: 100_988,
      })
      cy.task('stubHealth')
      cy.task('stubGetCSIPFailures')

      Page.verifyOnPage(CSIPMigrationPage).startNewMigration().click()
      cy.task('stubGetCSIPMigrationEstimatedCount', 100_988)

      const page = Page.verifyOnPage(StartCSIPMigrationPage)
      page.fromDate().type('2020-03-23')
      page.toDate().type('2020-03-30')

      page.continueButton().click()
      const previewPage = Page.verifyOnPage(StartCSIPMigrationPreviewPage)
      previewPage.estimateSummary().contains('Estimated number of CSIP entities to be migrated: 100,988')
      previewPage
        .dlqWarning()
        .contains(
          'There are 153 messages on the migration dead letter queue. Please clear these before starting the migration',
        )

      previewPage.fromDateRow().contains('2020-03-23')
      previewPage.fromDateChangeLink().click()

      // amend the from date
      const amendPage = Page.verifyOnPage(StartCSIPMigrationPage)
      amendPage.fromDate().clear()
      amendPage.fromDate().type('2020-03-20')
      page.continueButton().click()

      // check amended date displayed
      const previewPageAgain = Page.verifyOnPage(StartCSIPMigrationPreviewPage)
      previewPageAgain.fromDateRow().contains('2020-03-20')
      previewPageAgain.startMigrationButton().click()

      const confirmationPage = Page.verifyOnPage(StartCSIPMigrationConfirmationPage)
      confirmationPage.confirmationMessage().contains('100,988')
      confirmationPage.confirmationMessage().contains('2022-03-23T11:11:56')
      confirmationPage.detailsLink().contains('View migration status')
    })

    it('Can clear DLQ when there are message still present', () => {
      cy.task('stubStartCSIPMigration', {
        migrationId: '2022-03-23T11:11:56',
        estimatedCount: 100_988,
      })
      cy.task('stubHealth')
      cy.task('stubGetCSIPFailures')
      cy.task('stubDeleteCSIPFailures')

      Page.verifyOnPage(CSIPMigrationPage).startNewMigration().click()
      cy.task('stubGetCSIPMigrationEstimatedCount', 100_988)

      const page = Page.verifyOnPage(StartCSIPMigrationPage)
      page.fromDate().type('2020-03-23')
      page.toDate().type('2020-03-30')

      page.continueButton().click()
      const previewPage = Page.verifyOnPage(StartCSIPMigrationPreviewPage)
      previewPage.estimateSummary().contains('Estimated number of CSIP entities to be migrated: 100,988')
      previewPage
        .dlqWarning()
        .contains(
          'There are 153 messages on the migration dead letter queue. Please clear these before starting the migration',
        )

      previewPage.clearDlqMessages().click()

      const previewPageAgain = Page.verifyOnPage(StartCSIPMigrationPreviewPage)
      previewPageAgain.startMigrationButton().click()

      Page.verifyOnPage(StartCSIPMigrationConfirmationPage)
    })
  })
})
