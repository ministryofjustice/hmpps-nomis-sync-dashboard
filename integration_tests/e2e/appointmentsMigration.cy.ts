import IndexPage from '../pages/index'
import Page from '../pages/page'
import AppointmentsMigrationPage from '../pages/appointments-migration/appointmentsMigration'
import AppointmentsMigrationFailuresPage from '../pages/appointments-migration/appointmentsMigrationFailures'

context('Appointment Migration Homepage', () => {
  beforeEach(() => {
    cy.task('reset')
    cy.task('stubAuthUser')
  })
  context('With MIGRATE_APPOINTMENTS role', () => {
    beforeEach(() => {
      cy.task('stubSignIn', ['ROLE_MIGRATE_APPOINTMENTS'])
      cy.task('stubListOfAppointmentsMigrationHistory')
      cy.signIn()
    })
    it('should see migrate appointments tile', () => {
      const indexPage = Page.verifyOnPage(IndexPage)
      indexPage.appointmentsMigrationLink().should('be.visible')
    })
    it('should be able to navigate to the appointments migration home page', () => {
      const indexPage = Page.verifyOnPage(IndexPage)
      indexPage.appointmentsMigrationLink().click()
      Page.verifyOnPage(AppointmentsMigrationPage)
    })

    it('should display list of migrations', () => {
      cy.task('stubHealth')
      cy.task('stubGetAppointmentsFailures')

      const migrationPage = AppointmentsMigrationPage.goTo()

      migrationPage.prisons().type('MDI')
      migrationPage.fromDateTime().type('2022-03-12')
      migrationPage.toDateTime().type('2022-03-15')

      migrationPage.applyFiltersButton().click()

      migrationPage.migrationResultsRow(0).within(() => {
        cy.get('[data-qa=migration-id]').should('contain.text', '2022-03-14T10:13:56')
        cy.get('[data-qa=whenStarted]').should('contain.text', '14 March 2022 - 10:13')
        cy.get('[data-qa=whenEnded]').should('contain.text', '14 March 2022 - 10:14')
        cy.get('[data-qa=status]').should('contain.text', 'COMPLETED')
        cy.get('[data-qa=migratedCount]').should('contain.text', '0')
        cy.get('[data-qa=failedCount]').should('contain.text', '0')
        cy.get('[data-qa=estimatedCount]').should('contain.text', '0')
        cy.get('[data-qa=filterPrisonIds]').should('not.exist')
        cy.get('[data-qa=filterToDate]').should('not.exist')
        cy.get('[data-qa=filterFromDate]').should('contain.text', '4 March 2022')
        cy.get('[data-qa=progress-link]').should('not.exist')
        cy.get('[data-qa=failures-link]').should('not.exist')
      })
      migrationPage.migrationResultsRow(1).within(() => {
        cy.get('[data-qa=migration-id]').should('contain.text', '2022-03-14T11:45:12')
        cy.get('[data-qa=whenStarted]').should('contain.text', '14 March 2022 - 11:45')
        cy.get('[data-qa=whenEnded]').should('not.exist')
        cy.get('[data-qa=status]').should('contain.text', 'STARTED')
        cy.get('[data-qa=migratedCount]').should('contain.text', '1')
        cy.get('[data-qa=failedCount]').should('contain.text', '162794')
        cy.get('[data-qa=estimatedCount]').should('contain.text', '205630')
        cy.get('[data-qa=filterPrisonIds]').should('not.exist')
        cy.get('[data-qa=filterToDate]').should('not.exist')
        cy.get('[data-qa=filterFromDate]').should('not.exist')
        cy.get('[data-qa=progress-link]').should('contain.text', 'View progress')
        cy.get('[data-qa=failures-link]').should('contain.text', 'View failures')
        cy.get('[data-qa=already-migrated-link]').should('contain.text', 'View Insights')
      })
      migrationPage.migrationResultsRow(2).within(() => {
        cy.get('[data-qa=migration-id]').should('contain.text', '2022-03-15T11:00:35')
        cy.get('[data-qa=whenStarted]').should('contain.text', '15 March 2022 - 11:00')
        cy.get('[data-qa=whenEnded]').should('contain.text', '15 March 2022 - 11:00')
        cy.get('[data-qa=status]').should('contain.text', 'COMPLETED')
        cy.get('[data-qa=migratedCount]').should('contain.text', '0')
        cy.get('[data-qa=failedCount]').should('contain.text', '4')
        cy.get('[data-qa=estimatedCount]').should('contain.text', '4')
        cy.get('[data-qa=filterPrisonIds]').should('contain.text', 'MDI,SWI')
        cy.get('[data-qa=filterToDate]').should('contain.text', '17 April 2022')
        cy.get('[data-qa=filterFromDate]').should('not.exist')
        cy.get('[data-qa=progress-link]').should('not.exist')
        cy.get('[data-qa=failures-link]').should('contain.text', 'View failures')
        cy.get('[data-qa=already-migrated-link]').should('not.exist')
      })

      migrationPage.migrationResultsRow(1).within(() => {
        cy.get('[data-qa=failures-link]').click()
      })
      Page.verifyOnPage(AppointmentsMigrationFailuresPage)
    })

    it('will validate the dates when filtering', () => {
      const migrationPage = AppointmentsMigrationPage.goTo()

      migrationPage.fromDateTime().type('invalid')
      migrationPage.toDateTime().type('1971-67-12')

      migrationPage.applyFiltersButton().click()

      const pageWithErrors = Page.verifyOnPage(AppointmentsMigrationPage)
      pageWithErrors.fromDateTimeError().contains('Enter a real date time, like 2020-03-23T12:00:00 or 2020-03-23')
      pageWithErrors.toDateTimeError().contains('Enter a real date time, like 2020-03-23T12:00:00 or 2020-03-23')
    })
  })

  context('Without MIGRATE_APPOINTMENTS role', () => {
    beforeEach(() => {
      cy.task('stubSignIn', ['ROLE_MIGRATE_PRISONERS'])
      cy.signIn()
    })
    it('should not see migrate appointments tile', () => {
      const indexPage = Page.verifyOnPage(IndexPage)
      indexPage.appointmentsMigrationLink().should('not.exist')
    })
  })
})
