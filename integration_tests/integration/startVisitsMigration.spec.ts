import IndexPage from '../pages/index'
import Page from '../pages/page'
import StartVisitsMigrationPage from '../pages/visits-migration/startVisitsMigration'
import VisitsMigrationPage from '../pages/visits-migration/visitsMigration'

context('Visit Migration Homepage', () => {
  beforeEach(() => {
    cy.task('reset')
    cy.task('stubAuthUser')
  })
  context('With MIGRATE_VISITS role', () => {
    beforeEach(() => {
      cy.task('stubSignIn', ['ROLE_MIGRATE_VISITS'])
      cy.task('stubListOfMigrationHistory')
      cy.signIn()
      const indexPage = Page.verifyOnPage(IndexPage)
      indexPage.visitsMigrationLink().click()
    })
    it('can navigate to start migration page', () => {
      Page.verifyOnPage(VisitsMigrationPage).startNewMigration().click()
      Page.verifyOnPage(StartVisitsMigrationPage)
    })
  })
})
