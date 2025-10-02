import IndexPage from '../../pages'
import Page from '../../pages/page'
import PrisonBalanceMigrationPage from '../../pages/finance-migration/prisonBalanceMigration'
import PrisonBalanceMigrationFailuresPage from '../../pages/finance-migration/prisonBalanceMigrationFailures'
import prisonBalanceMigrationHistory from '../../mockApis/nomisPrisonBalanceMigrationApi'
import AuthErrorPage from '../../pages/authError'

context('Prison Balance Migration Homepage', () => {
  beforeEach(() => {
    cy.task('reset')
  })
  context('With MIGRATE_NOMIS_SYSCON role', () => {
    beforeEach(() => {
      cy.task('stubSignIn', { roles: ['ROLE_MIGRATE_NOMIS_SYSCON'] })
      cy.task('stubGetMigrationHistory', {
        migrationType: 'PRISON_BALANCE',
        history: prisonBalanceMigrationHistory,
      })
      cy.signIn()
    })
    it('should see migrate prison balance tile', () => {
      const indexPage = Page.verifyOnPage(IndexPage)
      indexPage.migrationLink('prison-balance-migration').should('be.visible')
    })
    it('should be able to navigate to the prison balance migration home page', () => {
      const indexPage = Page.verifyOnPage(IndexPage)
      indexPage.migrationLink('prison-balance-migration').click()
      Page.verifyOnPage(PrisonBalanceMigrationPage)
    })

    it('should display list of migrations', () => {
      cy.task('stubGetNoFailuresWithMigrationType', { migrationType: 'PRISON_BALANCE' })
      cy.task('stubGetFailureCountWithMigrationType', { migrationType: 'PRISON_BALANCE' })

      const migrationPage = PrisonBalanceMigrationPage.goTo()

      migrationPage.migrationResultsRow(0).within(() => {
        cy.get('[data-qa=migration-id]').should('contain.text', '2022-03-14T10:13:56')
        cy.get('[data-qa=whenStarted]').should('contain.text', '14 March 2022 - 10:13')
        cy.get('[data-qa=whenEnded]').should('contain.text', '14 March 2022 - 10:14')
        cy.get('[data-qa=status]').should('contain.text', 'COMPLETED')
        cy.get('[data-qa=migratedCount]').should('contain.text', '0')
        cy.get('[data-qa=failedCount]').should('contain.text', '0')
        cy.get('[data-qa=estimatedCount]').should('contain.text', '0')
        cy.get('[data-qa=filterPrisonId]').should('contain.text', 'HEI')
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
        cy.get('[data-qa=filterPrisonId]').should('not.exist')
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
        cy.get('[data-qa=filterPrisonId]').should('not.exist')
        cy.get('[data-qa=estimatedCount]').should('contain.text', '4')
        cy.get('[data-qa=progress-link]').should('not.exist')
        cy.get('[data-qa=failures-link]').should('contain.text', 'View failures')
        cy.get('[data-qa=already-migrated-link]').should('not.exist')
      })

      migrationPage.migrationResultsRow(1).within(() => {
        cy.get('[data-qa=failures-link]').click()
      })
      Page.verifyOnPage(PrisonBalanceMigrationFailuresPage)
    })
  })

  context('Without MIGRATE_NOMIS_SYSCON role', () => {
    beforeEach(() => {
      cy.task('stubSignIn', { roles: ['ROLE_MIGRATE_SOMETHING_ELSE'] })
      cy.signIn()
    })
    it('should not see migrate prison balance tile', () => {
      const indexPage = Page.verifyOnPage(IndexPage)
      indexPage.migrationLink('prison-balance-migration').should('not.exist')
    })
    it('should not be able to navigate directly to the prison balance migration page', () => {
      cy.visit('/prison-balance-migration', { failOnStatusCode: false })
      Page.verifyOnPage(AuthErrorPage)
    })
  })
})
