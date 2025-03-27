import VisitsMigrationFailuresPage from '../../pages/visits-migration/visitsMigrationFailures'
import { visitsFailures } from '../../mockApis/nomisVisitsMigrationApi'

context('Visit Migration Failures', () => {
  beforeEach(() => {
    cy.task('reset')
  })
  context('navigating directly to page', () => {
    beforeEach(() => {
      cy.task('stubSignIn', { roles: ['ROLE_MIGRATE_VISITS'] })
      cy.task('stubGetFailureCountWithMigrationType', { migrationType: 'VISITS' })
      cy.task('stubGetFailuresWithMigrationType', { migrationType: 'VISITS', failures: visitsFailures })
      cy.signIn()
    })
    it('should failures rows', () => {
      const page = VisitsMigrationFailuresPage.goTo()
      page.rows().should('have.length', 5)
    })
  })
})
