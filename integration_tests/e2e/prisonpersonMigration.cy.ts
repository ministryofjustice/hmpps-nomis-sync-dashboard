import IndexPage from '../pages/index'
import Page from '../pages/page'
import PrisonPersonMigrationPage from '../pages/prisonperson/prisonPersonMigration'
import PrisonPersonMigrationFailuresPage from '../pages/prisonperson/prisonpersonMigrationFailures'

context('Prison Person Migration Homepage', () => {
  beforeEach(() => {
    cy.task('reset')
  })
  context('With MIGRATE_PRISONPERSON role', () => {
    beforeEach(() => {
      cy.task('stubSignIn', { roles: ['ROLE_MIGRATE_PRISONPERSON'] })
      cy.task('stubListOfPrisonPersonMigrationHistory')
      cy.signIn()
    })
    it('should see migrate prison person tile', () => {
      const indexPage = Page.verifyOnPage(IndexPage)
      indexPage.prisonPersonMigrationLink().should('be.visible')
    })
    it('should be able to navigate to the prison person migration home page', () => {
      const indexPage = Page.verifyOnPage(IndexPage)
      indexPage.prisonPersonMigrationLink().click()
      Page.verifyOnPage(PrisonPersonMigrationPage)
    })

    it('should display list of migrations', () => {
      cy.task('stubHealth')
      cy.task('stubGetPrisonPersonFailures')

      const migrationPage = PrisonPersonMigrationPage.goTo()

      migrationPage.migrationResultsRow(0).within(() => {
        cy.get('[data-qa=migration-id]').should('contain.text', '2022-03-14T10:13:56')
        cy.get('[data-qa=whenStarted]').should('contain.text', '14 March 2022 - 10:13')
        cy.get('[data-qa=whenEnded]').should('contain.text', '14 March 2022 - 10:14')
        cy.get('[data-qa=status]').should('contain.text', 'COMPLETED')
        cy.get('[data-qa=migratedCount]').should('contain.text', '0')
        cy.get('[data-qa=failedCount]').should('contain.text', '0')
        cy.get('[data-qa=estimatedCount]').should('contain.text', '0')
        cy.get('[data-qa=filterPrisonerNumber]').should('not.exist')
        cy.get('[data-qa=filterMigrationType]').should('contain.text', 'PHYSICAL_ATTRIBUTES')
        cy.get('[data-qa=progress-link]').should('not.exist')
        cy.get('[data-qa=failures-link]').should('not.exist')
        cy.get('[data-qa=already-migrated-link]').should('not.exist')
      })
      migrationPage.migrationResultsRow(1).within(() => {
        cy.get('[data-qa=migration-id]').should('contain.text', '2022-03-14T11:45:12')
        cy.get('[data-qa=whenStarted]').should('contain.text', '14 March 2022 - 11:45')
        cy.get('[data-qa=whenEnded]').should('not.exist')
        cy.get('[data-qa=status]').should('contain.text', 'STARTED')
        cy.get('[data-qa=migratedCount]').should('contain.text', '1')
        cy.get('[data-qa=failedCount]').should('contain.text', '162794')
        cy.get('[data-qa=estimatedCount]').should('contain.text', '205630')
        cy.get('[data-qa=filterPrisonerNumber]').should('contain.text', 'A1234BC')
        cy.get('[data-qa=filterMigrationType]').should('contain.text', 'PHYSICAL_ATTRIBUTES')
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
        cy.get('[data-qa=filterPrisonerNumber]').should('not.exist')
        cy.get('[data-qa=filterMigrationType]').should('contain.text', 'PHYSICAL_ATTRIBUTES')
        cy.get('[data-qa=progress-link]').should('not.exist')
        cy.get('[data-qa=failures-link]').should('contain.text', 'View failures')
        cy.get('[data-qa=already-migrated-link]').should('not.exist')
      })

      migrationPage.migrationResultsRow(1).within(() => {
        cy.get('[data-qa=failures-link]').click()
      })
      Page.verifyOnPage(PrisonPersonMigrationFailuresPage)
    })
  })

  context('Without MIGRATE_PRISONPERSON role', () => {
    beforeEach(() => {
      cy.task('stubSignIn', { roles: ['ROLE_MIGRATE_PRISONERS'] })
      cy.signIn()
    })
    it('should not see migrate prison person tile', () => {
      const indexPage = Page.verifyOnPage(IndexPage)
      indexPage.prisonPersonMigrationLink().should('not.exist')
    })
  })
})
