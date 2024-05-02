import CSIPMigrationFailuresPage from '../pages/csip-migration/csipMigrationFailures'

context('CSIP Migration Failures', () => {
  beforeEach(() => {
    cy.task('reset')
    cy.task('stubManageUser')
  })
  context('navigating directly to page', () => {
    beforeEach(() => {
      cy.task('stubSignIn', ['ROLE_MIGRATE_CSIP'])
      cy.task('stubHealth')
      cy.task('stubGetCSIPFailures')
      cy.signIn()
    })
    it('should see failures rows', () => {
      const page = CSIPMigrationFailuresPage.goTo()
      page.rows().should('have.length', 5)
    })
  })
})
