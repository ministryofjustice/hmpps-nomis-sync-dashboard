import IndexPage from '../pages/index'
import Page from '../pages/page'
import StartIncentivesMigrationPage from '../pages/incentives-migration/startIncentivesMigration'
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
  })
})
