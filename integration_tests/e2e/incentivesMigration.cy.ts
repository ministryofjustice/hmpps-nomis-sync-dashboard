import IndexPage from '../pages/index'
import Page from '../pages/page'
import IncentivesMigrationPage from '../pages/incentives-migration/incentivesMigration'
import IncentivesMigrationFailuresPage from '../pages/incentives-migration/incentivesMigrationFailures'

context('Incentive Migration Homepage', () => {
  beforeEach(() => {
    cy.task('reset')
    cy.task('stubAuthUser')
  })
  context('With MIGRATE_INCENTIVES role', () => {
    beforeEach(() => {
      cy.task('stubSignIn', ['ROLE_MIGRATE_INCENTIVES'])
      cy.task('stubListOfIncentivesMigrationHistory')
      cy.signIn()
    })
    it('should see migrate incentives tile', () => {
      const indexPage = Page.verifyOnPage(IndexPage)
      indexPage.incentivesMigrationLink().should('be.visible')
    })
    it('should be able to navigate to the incentives migration home page', () => {
      const indexPage = Page.verifyOnPage(IndexPage)
      indexPage.incentivesMigrationLink().click()
      Page.verifyOnPage(IncentivesMigrationPage)
    })

    it('should display list of migrations', () => {
      cy.task('stubHealth')
      cy.task('stubGetIncentivesFailures')

      const migrationPage = IncentivesMigrationPage.goTo()

      migrationPage.fromDateTime().type('2022-03-12')
      migrationPage.toDateTime().type('2022-03-15')

      migrationPage.migrationResultsRow(0).within(() => {
        cy.get('[data-qa=migration-id]').should('contain.text', '2022-03-14T10:13:56')
        cy.get('[data-qa=whenStarted]').should('contain.text', '14 March 2022 - 10:13')
        cy.get('[data-qa=whenEnded]').should('contain.text', '14 March 2022 - 10:14')
        cy.get('[data-qa=status]').should('contain.text', 'COMPLETED')
        cy.get('[data-qa=migratedCount]').should('contain.text', '0')
        cy.get('[data-qa=failedCount]').should('contain.text', '0')
        cy.get('[data-qa=estimatedCount]').should('contain.text', '0')
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
        cy.get('[data-qa=filterToDate]').should('not.exist')
        cy.get('[data-qa=filterFromDate]').should('contain.text', '15 March 2022')
        cy.get('[data-qa=progress-link]').should('not.exist')
        cy.get('[data-qa=failures-link]').should('contain.text', 'View failures')
        cy.get('[data-qa=already-migrated-link]').should('not.exist')
      })

      migrationPage.migrationResultsRow(1).within(() => {
        cy.get('[data-qa=failures-link]').click()
      })
      Page.verifyOnPage(IncentivesMigrationFailuresPage)
    })

    it('will validate the dates when filtering', () => {
      const migrationPage = IncentivesMigrationPage.goTo()

      migrationPage.fromDateTime().type('invalid')
      migrationPage.toDateTime().type('1971-67-12')

      migrationPage.applyFiltersButton().click()

      const pageWithErrors = Page.verifyOnPage(IncentivesMigrationPage)
      pageWithErrors.fromDateTimeError().contains('Enter a real date time, like 2020-03-23T12:00:00 or 2020-03-23')
      pageWithErrors.toDateTimeError().contains('Enter a real date time, like 2020-03-23T12:00:00 or 2020-03-23')
    })
  })

  context('Without MIGRATE_INCENTIVES role', () => {
    beforeEach(() => {
      cy.task('stubSignIn', ['ROLE_MIGRATE_VISITS'])
      cy.signIn()
    })
    it('should not see migrate incentives tile', () => {
      const indexPage = Page.verifyOnPage(IndexPage)
      indexPage.incentivesMigrationLink().should('not.exist')
    })
  })
})
