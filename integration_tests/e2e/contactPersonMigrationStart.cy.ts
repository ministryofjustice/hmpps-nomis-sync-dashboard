import IndexPage from '../pages/index'
import Page from '../pages/page'
import ContactPersonMigrationPage from '../pages/contactperson-migration/contactPersonMigration'
import StartContactPersonMigrationPage from '../pages/contactperson-migration/startContactPersonMigration'
import StartContactPersonMigrationPreviewPage from '../pages/contactperson-migration/startContactPersonMigrationPreview'
import StartContactPersonMigrationConfirmationPage from '../pages/contactperson-migration/startContactPersonMigrationConfirmation'

context('Contact Person Migration Start', () => {
  beforeEach(() => {
    cy.task('reset')
  })
  context('With MIGRATE_NOMIS_SYSCON role', () => {
    beforeEach(() => {
      cy.task('stubSignIn', { roles: ['ROLE_MIGRATE_NOMIS_SYSCON'] })
      cy.task('stubListOfMigrationHistory', { domain: 'contactperson' })
      cy.signIn()
      const indexPage = Page.verifyOnPage(IndexPage)
      indexPage.contactPersonMigrationLink().click()
    })
    it('can navigate to start migration page', () => {
      Page.verifyOnPage(ContactPersonMigrationPage).startNewMigration().click()
      Page.verifyOnPage(StartContactPersonMigrationPage)
    })

    it('will validate page when selecting start migration', () => {
      Page.verifyOnPage(ContactPersonMigrationPage).startNewMigration().click()
      const page = Page.verifyOnPage(StartContactPersonMigrationPage)
      page.fromDate().type('invalid')
      page.toDate().type('invalid')

      page.continueButton().click()

      const pageWithErrors = Page.verifyOnPage(StartContactPersonMigrationPage)
      pageWithErrors.errorSummary().contains('Enter a real date, like 2020-03-23')
    })
    it('Preview of migration will be shown and changes allowed prior to starting a migration', () => {
      cy.task('stubStartMigration', {
        domain: 'contactperson',
        response: {
          migrationId: '2022-03-23T11:11:56',
          estimatedCount: 100_988,
        },
      })
      cy.task('stubHealth')
      cy.task('stubGetFailures', { queue: 'dps-syscon-dev-contactpersonmigration_dlq' })

      Page.verifyOnPage(ContactPersonMigrationPage).startNewMigration().click()
      cy.task('stubGetContactPersonMigrationEstimatedCount', 100_988)

      const page = Page.verifyOnPage(StartContactPersonMigrationPage)
      page.fromDate().type('2020-03-23')
      page.toDate().type('2020-03-30')

      page.continueButton().click()
      const previewPage = Page.verifyOnPage(StartContactPersonMigrationPreviewPage)
      previewPage.estimateSummary().contains('Estimated number of Person entities to be migrated: 100,988')
      previewPage
        .dlqWarning()
        .contains(
          'There are 153 messages on the migration dead letter queue. Please clear these before starting the migration',
        )

      previewPage.fromDateRow().contains('2020-03-23')
      previewPage.fromDateChangeLink().click()

      // amend the from date
      const amendPage = Page.verifyOnPage(StartContactPersonMigrationPage)
      amendPage.fromDate().clear()
      amendPage.fromDate().type('2020-03-20')
      amendPage.continueButton().click()

      // check amended date displayed
      const previewPageAgain = Page.verifyOnPage(StartContactPersonMigrationPreviewPage)
      previewPageAgain.fromDateRow().contains('2020-03-20')
      previewPageAgain.startMigrationButton().click()

      const confirmationPage = Page.verifyOnPage(StartContactPersonMigrationConfirmationPage)
      confirmationPage.confirmationMessage().contains('100,988')
      confirmationPage.confirmationMessage().contains('2022-03-23T11:11:56')
      confirmationPage.detailsLink().contains('View migration status')
    })
  })
})
