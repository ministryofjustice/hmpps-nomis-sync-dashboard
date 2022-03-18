import IndexPage from '../pages/index'
import Page from '../pages/page'
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
    })
    it('should see migrate visits tile', () => {
      const indexPage = Page.verifyOnPage(IndexPage)
      indexPage.visitsMigrationLink().should('be.visible')
    })
    it('should be able to navigate to the visits migration home page', () => {
      const indexPage = Page.verifyOnPage(IndexPage)
      indexPage.visitsMigrationLink().click()
      Page.verifyOnPage(VisitsMigrationPage)
    })
  })
  context('Without MIGRATE_VISITS role', () => {
    beforeEach(() => {
      cy.task('stubSignIn', ['ROLE_MIGRATE_PRISONERS'])
      cy.signIn()
    })
    it('should not see migrate visits tile', () => {
      const indexPage = Page.verifyOnPage(IndexPage)
      indexPage.visitsMigrationLink().should('not.exist')
    })
  })
})
