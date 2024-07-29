import PrisonPersonMigrationFailuresPage from '../pages/prisonperson/prisonpersonMigrationFailures'

context('Prison Person Migration Failures', () => {
  beforeEach(() => {
    cy.task('reset')
  })
  context('navigating directly to page', () => {
    beforeEach(() => {
      cy.task('stubSignIn', { roles: ['ROLE_MIGRATE_PRISONPERSON'] })
      cy.task('stubHealth')
      cy.task('stubGetPrisonPersonFailures')
      cy.signIn()
    })
    it('should see failures rows', () => {
      const page = PrisonPersonMigrationFailuresPage.goTo()
      page.rows().should('have.length', 5)
    })
  })
})
