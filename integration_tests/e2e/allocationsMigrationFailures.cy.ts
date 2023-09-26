import AllocationsMigrationFailuresPage from '../pages/allocations-migration/allocationsMigrationFailures'

context('Allocations Migration Failures', () => {
  beforeEach(() => {
    cy.task('reset')
    cy.task('stubAuthUser')
  })
  context('navigating directly to page', () => {
    beforeEach(() => {
      cy.task('stubSignIn', ['ROLE_MIGRATE_ACTIVITIES'])
      cy.task('stubHealth')
      cy.task('stubGetAllocationsFailures')
      cy.signIn()
    })
    it('should see failures rows', () => {
      const page = AllocationsMigrationFailuresPage.goTo()
      page.rows().should('have.length', 5)
    })
  })
})
