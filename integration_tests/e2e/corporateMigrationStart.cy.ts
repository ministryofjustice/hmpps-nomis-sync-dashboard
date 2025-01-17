import IndexPage from '../pages/index'
import Page from '../pages/page'
import CorporateMigrationPage from '../pages/corporate-migration/corporateMigration'
import StartCorporateMigrationPage from '../pages/corporate-migration/startCorporateMigration'
import StartCorporateMigrationPreviewPage from '../pages/corporate-migration/startCorporateMigrationPreview'
import StartCorporateMigrationConfirmationPage from '../pages/corporate-migration/startCorporateMigrationConfirmation'

context('Corporate Migration Start', () => {
  beforeEach(() => {
    cy.task('reset')
  })
  context('With MIGRATE_NOMIS_SYSCON role', () => {
    beforeEach(() => {
      cy.task('stubSignIn', { roles: ['ROLE_MIGRATE_NOMIS_SYSCON'] })
      cy.task('stubListOfMigrationHistory', 'corporate')
      cy.signIn()
      const indexPage = Page.verifyOnPage(IndexPage)
      indexPage.corporateMigrationLink().click()
    })
    it('can navigate to start migration page', () => {
      Page.verifyOnPage(CorporateMigrationPage).startNewMigration().click()
      Page.verifyOnPage(StartCorporateMigrationPage)
    })

    it('will validate page when selecting start migration', () => {
      Page.verifyOnPage(CorporateMigrationPage).startNewMigration().click()
      const page = Page.verifyOnPage(StartCorporateMigrationPage)
      page.fromDate().type('invalid')
      page.toDate().type('invalid')

      page.continueButton().click()

      const pageWithErrors = Page.verifyOnPage(StartCorporateMigrationPage)
      pageWithErrors.errorSummary().contains('Enter a real date, like 2020-03-23')
    })
    it('Preview of migration will be shown and changes allowed prior to starting a migration', () => {
      cy.task('stubStartDateFilteredMigration', {
        domain: 'corporate',
        response: {
          migrationId: '2022-03-23T11:11:56',
          estimatedCount: 100_988,
        },
      })
      cy.task('stubHealth')
      cy.task('stubGetFailures', { queue: 'dps-syscon-dev-corporatemigration_dlq' })

      Page.verifyOnPage(CorporateMigrationPage).startNewMigration().click()
      cy.task('stubGetCorporateMigrationEstimatedCount', 100_988)

      const page = Page.verifyOnPage(StartCorporateMigrationPage)
      page.fromDate().type('2020-03-23')
      page.toDate().type('2020-03-30')

      page.continueButton().click()
      const previewPage = Page.verifyOnPage(StartCorporateMigrationPreviewPage)
      previewPage.estimateSummary().contains('Estimated number of Corporate entities to be migrated: 100,988')
      previewPage
        .dlqWarning()
        .contains(
          'There are 153 messages on the migration dead letter queue. Please clear these before starting the migration',
        )

      previewPage.fromDateRow().contains('2020-03-23')
      previewPage.fromDateChangeLink().click()

      // amend the from date
      const amendPage = Page.verifyOnPage(StartCorporateMigrationPage)
      amendPage.fromDate().clear()
      amendPage.fromDate().type('2020-03-20')
      amendPage.continueButton().click()

      // check amended date displayed
      const previewPageAgain = Page.verifyOnPage(StartCorporateMigrationPreviewPage)
      previewPageAgain.fromDateRow().contains('2020-03-20')
      previewPageAgain.startMigrationButton().click()

      const confirmationPage = Page.verifyOnPage(StartCorporateMigrationConfirmationPage)
      confirmationPage.confirmationMessage().contains('100,988')
      confirmationPage.confirmationMessage().contains('2022-03-23T11:11:56')
      confirmationPage.detailsLink().contains('View migration status')
    })
  })
})
