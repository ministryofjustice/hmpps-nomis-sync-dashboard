import IncidentsMigrationFailuresPage from '../pages/incidents-migration/incidentsMigrationFailures'

context('Incidents Migration Failures', () => {
  beforeEach(() => {
    cy.task('reset')
  })
  context('navigating directly to page', () => {
    beforeEach(() => {
      cy.task('stubSignIn', { roles: ['ROLE_MIGRATE_INCIDENT_REPORTS'] })
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
