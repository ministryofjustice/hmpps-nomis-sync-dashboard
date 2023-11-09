import IndexPage from '../pages/index'
import Page from '../pages/page'
import StartSentencingMigrationPage from '../pages/sentencing-migration/startSentencingMigration'
import StartSentencingMigrationConfirmationPage from '../pages/sentencing-migration/startSentencingMigrationConfirmation'
import StartSentencingMigrationPreviewPage from '../pages/sentencing-migration/startSentencingMigrationPreview'

import SentencingMigrationPage from '../pages/sentencing-migration/sentencingMigration'

context('Start Sentencing Migration', () => {
  beforeEach(() => {
    cy.task('reset')
    cy.task('stubManageUser')
  })
  context('With MIGRATE_SENTENCING role', () => {
    beforeEach(() => {
      cy.task('stubSignIn', ['ROLE_MIGRATE_SENTENCING'])
      cy.task('stubListOfSentencingMigrationHistory')
      cy.signIn()
      const indexPage = Page.verifyOnPage(IndexPage)
      indexPage.sentencingMigrationLink().click()
    })
    it('can navigate to start migration page', () => {
      Page.verifyOnPage(SentencingMigrationPage).startNewMigration().click()
      Page.verifyOnPage(StartSentencingMigrationPage)
    })

    it('will validate page when selecting start migration', () => {
      Page.verifyOnPage(SentencingMigrationPage).startNewMigration().click()
      const page = Page.verifyOnPage(StartSentencingMigrationPage)
      page.fromDate().type('invalid')
      page.toDate().type('invalid')

      page.continueButton().click()

      const pageWithErrors = Page.verifyOnPage(StartSentencingMigrationPage)
      pageWithErrors.errorSummary().contains('Enter a real date, like 2020-03-23')
    })
    it('Preview of migration will be shown and changes allowed prior to starting a migration', () => {
      cy.task('stubStartSentencingMigration', {
        migrationId: '2022-03-23T11:11:56',
        estimatedCount: 100_988,
      })
      cy.task('stubHealth')
      cy.task('stubGetSentencingFailures')

      Page.verifyOnPage(SentencingMigrationPage).startNewMigration().click()
      cy.task('stubGetSentencingMigrationEstimatedCount', 100_988)

      const page = Page.verifyOnPage(StartSentencingMigrationPage)
      page.fromDate().type('2020-03-23')
      page.toDate().type('2020-03-30')

      page.continueButton().click()
      const previewPage = Page.verifyOnPage(StartSentencingMigrationPreviewPage)
      previewPage.estimateSummary().contains('Estimated number of Sentencing entities to be migrated: 100,988')
      previewPage
        .dlqWarning()
        .contains(
          'There are 153 messages on the migration dead letter queue. Please clear these before starting the migration',
        )

      previewPage.fromDateRow().contains('2020-03-23')
      previewPage.fromDateChangeLink().click()

      // amend the from date
      const amendPage = Page.verifyOnPage(StartSentencingMigrationPage)
      amendPage.fromDate().clear()
      amendPage.fromDate().type('2020-03-20')
      page.continueButton().click()

      // check amended date displayed
      const previewPageAgain = Page.verifyOnPage(StartSentencingMigrationPreviewPage)
      previewPageAgain.fromDateRow().contains('2020-03-20')
      previewPageAgain.startMigrationButton().click()

      const confirmationPage = Page.verifyOnPage(StartSentencingMigrationConfirmationPage)
      confirmationPage.confirmationMessage().contains('100,988')
      confirmationPage.confirmationMessage().contains('2022-03-23T11:11:56')
      confirmationPage.detailsLink().contains('View migration status')
    })

    it('Can clear DLQ when there are message still present', () => {
      cy.task('stubStartSentencingMigration', {
        migrationId: '2022-03-23T11:11:56',
        estimatedCount: 100_988,
      })
      cy.task('stubHealth')
      cy.task('stubGetSentencingFailures')
      cy.task('stubDeleteSentencingFailures')

      Page.verifyOnPage(SentencingMigrationPage).startNewMigration().click()
      cy.task('stubGetSentencingMigrationEstimatedCount', 100_988)

      const page = Page.verifyOnPage(StartSentencingMigrationPage)
      page.fromDate().type('2020-03-23')
      page.toDate().type('2020-03-30')

      page.continueButton().click()
      const previewPage = Page.verifyOnPage(StartSentencingMigrationPreviewPage)
      previewPage.estimateSummary().contains('Estimated number of Sentencing entities to be migrated: 100,988')
      previewPage
        .dlqWarning()
        .contains(
          'There are 153 messages on the migration dead letter queue. Please clear these before starting the migration',
        )

      previewPage.clearDlqMessages().click()

      const previewPageAgain = Page.verifyOnPage(StartSentencingMigrationPreviewPage)
      previewPageAgain.startMigrationButton().click()

      Page.verifyOnPage(StartSentencingMigrationConfirmationPage)
    })
  })
})
