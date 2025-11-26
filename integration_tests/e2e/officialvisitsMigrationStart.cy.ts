import IndexPage from '../pages/index'
import Page from '../pages/page'
import OfficialvisitsMigrationPage from '../pages/officialvisits-migration/officialvisitsMigration'
import StartOfficialvisitsMigrationPage from '../pages/officialvisits-migration/startOfficialvisitsMigration'
import StartOfficialvisitsMigrationPreviewPage from '../pages/officialvisits-migration/startOfficialvisitsMigrationPreview'
import StartOfficialvisitsMigrationConfirmationPage from '../pages/officialvisits-migration/startOfficialvisitsMigrationConfirmation'
import AuthErrorPage from '../pages/authError'

context('Official visits Migration Start', () => {
  beforeEach(() => {
    cy.task('reset')
  })
  context('With MIGRATE_NOMIS_SYSCON role', () => {
    beforeEach(() => {
      cy.task('stubSignIn', { roles: ['ROLE_MIGRATE_NOMIS_SYSCON'] })
      cy.task('stubGetMigrationHistory', { migrationType: 'OFFICIAL_VISITS' })
      cy.signIn()
      const indexPage = Page.verifyOnPage(IndexPage)
      indexPage.migrationLink('officialvisits-migration').click()
    })
    it('can navigate to start migration page', () => {
      Page.verifyOnPage(OfficialvisitsMigrationPage).startNewMigration().click()
      Page.verifyOnPage(StartOfficialvisitsMigrationPage)
    })

    it('will validate page when selecting start migration', () => {
      Page.verifyOnPage(OfficialvisitsMigrationPage).startNewMigration().click()
      const page = Page.verifyOnPage(StartOfficialvisitsMigrationPage)
      page.fromDate().type('invalid')
      page.toDate().type('invalid')

      page.continueButton().click()

      const pageWithErrors = Page.verifyOnPage(StartOfficialvisitsMigrationPage)
      pageWithErrors.errorSummary().contains('Enter a real date, like 2020-03-23')
    })
    it('Preview of migration will be shown and changes allowed prior to starting a migration', () => {
      cy.task('stubStartMigration', {
        domain: 'official-visits',
        response: {
          migrationId: '2022-03-23T11:11:56',
          estimatedCount: 100_988,
        },
      })
      cy.task('stubGetFailureCountWithMigrationType', { migrationType: 'OFFICIAL_VISITS' })
      cy.task('stubGetFailuresWithMigrationType', { migrationType: 'OFFICIAL_VISITS' })

      Page.verifyOnPage(OfficialvisitsMigrationPage).startNewMigration().click()
      cy.task('stubGetOfficialvisitsMigrationEstimatedCount', 100_988)

      const page = Page.verifyOnPage(StartOfficialvisitsMigrationPage)
      page.fromDate().type('2020-03-23')
      page.toDate().type('2020-03-30')

      page.continueButton().click()
      const previewPage = Page.verifyOnPage(StartOfficialvisitsMigrationPreviewPage)
      previewPage.estimateSummary().contains('Estimated number of Visit entities to be migrated: 100,988')
      previewPage
        .dlqWarning()
        .contains(
          'There are 153 messages on the migration dead letter queue. Please clear these before starting the migration',
        )

      previewPage.fromDateRow().contains('2020-03-23')
      previewPage.fromDateChangeLink().click()

      // amend the from date
      const amendPage = Page.verifyOnPage(StartOfficialvisitsMigrationPage)
      amendPage.fromDate().clear()
      amendPage.fromDate().type('2020-03-20')
      amendPage.continueButton().click()

      // check amended date displayed
      const previewPageAgain = Page.verifyOnPage(StartOfficialvisitsMigrationPreviewPage)
      previewPageAgain.fromDateRow().contains('2020-03-20')
      previewPageAgain.startMigrationButton().click()

      const confirmationPage = Page.verifyOnPage(StartOfficialvisitsMigrationConfirmationPage)
      confirmationPage.confirmationMessage().contains('100,988')
      confirmationPage.confirmationMessage().contains('2022-03-23T11:11:56')
      confirmationPage.detailsLink().contains('View migration status')
    })
  })

  context('Without MIGRATE_NOMIS_SYSCON role', () => {
    beforeEach(() => {
      cy.task('stubSignIn', { roles: ['ROLE_MIGRATE_PRISONERS'] })
      cy.signIn()
    })
    it('should not see migrate official visits tile', () => {
      const indexPage = Page.verifyOnPage(IndexPage)
      indexPage.migrationLink('officialvisits-migration').should('not.exist')
    })
    it('should not be able to navigate directly to the official visits migration page', () => {
      cy.visit('/officialvisits-migration', { failOnStatusCode: false })
      Page.verifyOnPage(AuthErrorPage)
    })
  })
})
