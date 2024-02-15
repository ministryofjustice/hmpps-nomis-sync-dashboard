import IncidentsMigrationFailuresPage from '../pages/incidents-migration/incidentsMigrationFailures'

context('Incidents Migration Failures', () => {
  beforeEach(() => {
    cy.task('reset')
    cy.task('stubManageUser')
  })
  context('navigating directly to page', () => {
    beforeEach(() => {
      cy.task('stubSignIn', ['ROLE_MIGRATE_INCIDENTS'])
      cy.task('stubHealth')
      cy.task('stubGetIncidentsFailures')
      cy.signIn()
    })
    it('should see failures rows', () => {
      const page = IncidentsMigrationFailuresPage.goTo()
      page.rows().should('have.length', 5)
    })
  })
})
