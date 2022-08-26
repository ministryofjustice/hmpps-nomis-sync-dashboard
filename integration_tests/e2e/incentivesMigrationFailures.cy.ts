import IncentivesMigrationFailuresPage from '../pages/incentives-migration/incentivesMigrationFailures'

context('Incentive Migration Failures', () => {
  beforeEach(() => {
    cy.task('reset')
    cy.task('stubAuthUser')
  })
  context('navigating directly to page', () => {
    beforeEach(() => {
      cy.task('stubSignIn', ['ROLE_MIGRATE_INCENTIVES'])
      cy.task('stubHealth')
      cy.task('stubGetIncentivesFailures')
      cy.signIn()
    })
    it('should failures rows', () => {
      const page = IncentivesMigrationFailuresPage.goTo()
      page.rows().should('have.length', 5)
    })
  })
})
