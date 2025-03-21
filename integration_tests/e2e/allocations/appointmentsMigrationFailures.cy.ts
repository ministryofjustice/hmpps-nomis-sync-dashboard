import AppointmentsMigrationFailuresPage from '../../pages/appointments-migration/appointmentsMigrationFailures'

context('Appointment Migration Failures', () => {
  beforeEach(() => {
    cy.task('reset')
  })
  context('navigating directly to page', () => {
    beforeEach(() => {
      cy.task('stubSignIn', { roles: ['ROLE_MIGRATE_APPOINTMENTS'] })
      cy.task('stubHealth')
      cy.task('stubGetAppointmentsFailures')
      cy.signIn()
    })
    it('should see failures rows', () => {
      const page = AppointmentsMigrationFailuresPage.goTo()
      page.rows().should('have.length', 5)
    })
  })
})
