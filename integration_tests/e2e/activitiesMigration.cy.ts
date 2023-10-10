import IndexPage from '../pages/index'
import Page from '../pages/page'
import ActivitiesMigrationPage from '../pages/activities-migration/activitiesMigration'
import ActivitiesMigrationFailuresPage from '../pages/activities-migration/activitiesMigrationFailures'
import StarAllocationsMigrationPage from '../pages/allocations-migration/startAllocationsMigration'

context('Activities Migration Homepage', () => {
  beforeEach(() => {
    cy.task('reset')
    cy.task('stubAuthUser')
  })
  context('With MIGRATE_ACTIVITIES role', () => {
    beforeEach(() => {
      cy.task('stubSignIn', ['ROLE_MIGRATE_ACTIVITIES'])
      cy.task('stubListOfActivitiesMigrationHistory')
      cy.signIn()
    })
    it('should see migrate activities tile', () => {
      const indexPage = Page.verifyOnPage(IndexPage)
      indexPage.activitiesMigrationLink().should('be.visible')
    })
    it('should be able to navigate to the activities migration home page', () => {
      const indexPage = Page.verifyOnPage(IndexPage)
      indexPage.activitiesMigrationLink().click()
      Page.verifyOnPage(ActivitiesMigrationPage)
    })

    it('should display list of migrations', () => {
      cy.task('stubHealth')
      cy.task('stubGetActivitiesFailures')

      const migrationPage = ActivitiesMigrationPage.goTo()

      migrationPage.migrationResultsRow(0).within(() => {
        cy.get('[data-qa=migration-id]').should('contain.text', '2022-03-14T10:13:56')
        cy.get('[data-qa=whenStarted]').should('contain.text', '14 March 2022 - 10:13')
        cy.get('[data-qa=whenEnded]').should('contain.text', '14 March 2022 - 10:14')
        cy.get('[data-qa=status]').should('contain.text', 'COMPLETED')
        cy.get('[data-qa=migratedCount]').should('contain.text', '0')
        cy.get('[data-qa=failedCount]').should('contain.text', '0')
        cy.get('[data-qa=estimatedCount]').should('contain.text', '0')
        cy.get('[data-qa=progress-link]').should('not.exist')
        cy.get('[data-qa=failures-link]').should('not.exist')
        cy.get('[data-qa=already-migrated-link]').should('not.exist')
        cy.get('[data-qa=end-activities-button]').should('exist')
      })
      migrationPage.migrationResultsRow(1).within(() => {
        cy.get('[data-qa=migration-id]').should('contain.text', '2022-03-14T11:45:12')
        cy.get('[data-qa=whenStarted]').should('contain.text', '14 March 2022 - 11:45')
        cy.get('[data-qa=whenEnded]').should('not.exist')
        cy.get('[data-qa=status]').should('contain.text', 'STARTED')
        cy.get('[data-qa=migratedCount]').should('contain.text', '1')
        cy.get('[data-qa=failedCount]').should('contain.text', '162794')
        cy.get('[data-qa=estimatedCount]').should('contain.text', '205630')
        cy.get('[data-qa=progress-link]').should('contain.text', 'View progress')
        cy.get('[data-qa=failures-link]').should('contain.text', 'View failures')
        cy.get('[data-qa=already-migrated-link]').should('contain.text', 'View Insights')
        cy.get('[data-qa=end-activities-button]').should('exist')
      })
      migrationPage.migrationResultsRow(2).within(() => {
        cy.get('[data-qa=migration-id]').should('contain.text', '2022-03-15T11:00:35')
        cy.get('[data-qa=whenStarted]').should('contain.text', '15 March 2022 - 11:00')
        cy.get('[data-qa=whenEnded]').should('contain.text', '15 March 2022 - 11:00')
        cy.get('[data-qa=status]').should('contain.text', 'COMPLETED')
        cy.get('[data-qa=migratedCount]').should('contain.text', '0')
        cy.get('[data-qa=failedCount]').should('contain.text', '4')
        cy.get('[data-qa=estimatedCount]').should('contain.text', '4')
        cy.get('[data-qa=progress-link]').should('not.exist')
        cy.get('[data-qa=failures-link]').should('contain.text', 'View failures')
        cy.get('[data-qa=already-migrated-link]').should('not.exist')
        cy.get('[data-qa=end-activities-button]').should('exist')
      })

      migrationPage.migrationResultsRow(1).within(() => {
        cy.get('[data-qa=failures-link]').click()
      })
      Page.verifyOnPage(ActivitiesMigrationFailuresPage)
    })

    it('should click through to allocation migration', () => {
      cy.task('stubHealth')

      const migrationPage = ActivitiesMigrationPage.goTo()

      migrationPage.migrationResultsRow(1).within(() => {
        cy.get('[data-qa=migrate-allocations-link]').click()
      })

      const allocationPage = Page.verifyOnPage(StarAllocationsMigrationPage)
      allocationPage.prisonId().should('have.value', 'WWI')
      allocationPage.courseActivityId().should('have.value', '123456')
    })
  })

  context('Without MIGRATE_ACTIVITIES role', () => {
    beforeEach(() => {
      cy.task('stubSignIn', ['ROLE_MIGRATE_PRISONERS'])
      cy.signIn()
    })
    it('should not see migrate activities tile', () => {
      const indexPage = Page.verifyOnPage(IndexPage)
      indexPage.activitiesMigrationLink().should('not.exist')
    })
  })
})
