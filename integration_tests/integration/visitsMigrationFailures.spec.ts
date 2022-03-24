import VisitsMigrationFailuresPage from '../pages/visits-migration/visitsMigrationFailures'

context('Visit Migration Failures', () => {
  beforeEach(() => {
    cy.task('reset')
    cy.task('stubAuthUser')
  })
  context('navigating directly to page', () => {
    beforeEach(() => {
      cy.task('stubSignIn', ['ROLE_MIGRATE_VISITS'])
      cy.task('stubHealth')
      cy.task('stubGetFailures')
      cy.signIn()
    })
    it('should failures rows', () => {
      const page = VisitsMigrationFailuresPage.goTo()
      page.rows().should('have.length', 5)
    })
  })
})
