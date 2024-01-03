import ActivitiesMigrationFailuresPage from '../pages/activities-migration/activitiesMigrationFailures'

context('Activities Migration Failures', () => {
  beforeEach(() => {
    cy.task('reset')
    cy.task('stubManageUser')
  })
  context('navigating directly to page', () => {
    beforeEach(() => {
      cy.task('stubSignIn', ['ROLE_MIGRATE_ACTIVITIES'])
      cy.task('stubHealth')
      cy.task('stubGetActivitiesWithFailures')
      cy.signIn()
    })
    it('should see failures rows', () => {
      const page = ActivitiesMigrationFailuresPage.goTo()
      page.rows().should('have.length', 5)
    })
  })
})
