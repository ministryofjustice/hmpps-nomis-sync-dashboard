import IncidentsMigrationFailuresPage from '../../pages/incidents-migration/incidentsMigrationFailures'
import { incidentsFailures } from '../../mockApis/nomisIncidentsMigrationApi'

context('Incidents Migration Failures', () => {
  beforeEach(() => {
    cy.task('reset')
  })
  context('navigating directly to page', () => {
    beforeEach(() => {
      cy.task('stubSignIn', { roles: ['ROLE_MIGRATE_INCIDENT_REPORTS'] })
      cy.task('stubGetFailureCountWithMigrationType', { migrationType: 'INCIDENTS' })
      cy.task('stubGetFailuresWithMigrationType', { migrationType: 'INCIDENTS', failures: incidentsFailures })
      cy.signIn()
    })
    it('should see failures rows', () => {
      const page = IncidentsMigrationFailuresPage.goTo()
      page.rows().should('have.length', 5)
    })
  })
})
