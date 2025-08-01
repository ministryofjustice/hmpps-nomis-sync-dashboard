import moment from 'moment/moment'
import IndexPage from '../../pages'
import Page from '../../pages/page'
import ActivitiesMigrationPage from '../../pages/activities-migration/activitiesMigration'
import StarAllocationsMigrationPage from '../../pages/allocations-migration/startAllocationsMigration'
import { activitiesMigrationHistory } from '../../mockApis/nomisActivitiesMigrationApi'
import AuthErrorPage from '../../pages/authError'
import StartAllocationsMigrationPreviewPage from '../../pages/allocations-migration/startAllocationsMigrationPreview'

context('Activities Migration Homepage', () => {
  beforeEach(() => {
    cy.task('reset')
  })
  context('With MIGRATE_ACTIVITIES role', () => {
    beforeEach(() => {
      cy.task('stubSignIn', { roles: ['ROLE_MIGRATE_ACTIVITIES'] })
      cy.task('stubGetMigrationHistory', { migrationType: 'ACTIVITIES', history: activitiesMigrationHistory })
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
      cy.task('stubGetFailureCountWithMigrationType', { migrationType: 'ACTIVITIES' })
      cy.task('stubGetNoFailuresWithMigrationType', { migrationType: 'ACTIVITIES' })

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
        cy.get('[data-qa=all-events-link]').should('exist')
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
        cy.get('[data-qa=failures-link]').should('exist')
        cy.get('[data-qa=all-events-link]').should('exist')
        cy.get('[data-qa=already-migrated-link]').should('not.exist')
        cy.get('[data-qa=end-activities-button]').should('exist')
      })
      migrationPage.migrationResultsRow(2).within(() => {
        cy.get('[data-qa=migration-id]').should('contain.text', '2022-03-15T11:00:35')
        cy.get('[data-qa=whenStarted]').should('contain.text', '15 March 2022 - 11:00')
        cy.get('[data-qa=whenEnded]').should('contain.text', '15 March 2022 - 11:00')
        cy.get('[data-qa=status]').should('contain.text', 'COMPLETED')
        cy.get('[data-qa=migratedCount]').should('contain.text', '0')
        cy.get('[data-qa=failedCount]').should('contain.text', '3')
        cy.get('[data-qa=estimatedCount]').should('contain.text', '4')
        cy.get('[data-qa=progress-link]').should('not.exist')
        cy.get('[data-qa=failures-link]').should('contain.text', 'View failures')
        cy.get('[data-qa=all-events-link]').should('exist')
        cy.get('[data-qa=already-migrated-link]').should('exist')
        cy.get('[data-qa=end-activities-button]').should('exist')
      })
    })

    it('should click through to allocation migration', () => {
      cy.task('stubGetFailureCountWithMigrationType', { migrationType: 'ACTIVITIES' })
      cy.task('stubStartAllocationsMigration', {
        migrationId: '2022-03-23T11:11:56',
        estimatedCount: 100_988,
      })
      cy.task('stubGetFailureCountWithMigrationType', { migrationType: 'ALLOCATIONS' })
      cy.task('stubGetNoFailuresWithMigrationType', { migrationType: 'ALLOCATIONS' })
      cy.task('stubGetAllocationsMigrationEstimatedCount', 100_988)

      const migrationPage = ActivitiesMigrationPage.goTo()

      migrationPage.migrationResultsRow(1).within(() => {
        cy.get('[data-qa=migrate-allocations-link]').click()
      })

      const allocationPage = Page.verifyOnPage(StarAllocationsMigrationPage)
      allocationPage.prisonId().should('have.value', 'WWI')
      allocationPage.courseActivityId().should('have.value', '123456')
      // The start date should be disabled but stored in a hidden form field
      allocationPage.activityStartDate().should('have.value', moment().add(2, 'days').format('YYYY-MM-DD'))
      allocationPage.activityStartDate().should('have.attr', 'disabled')
      allocationPage.hiddenActivityStartDate().should('have.value', moment().add(2, 'days').format('YYYY-MM-DD'))

      // The hidden start date should be pulled through to the preview form
      allocationPage.continueButton().click()
      const allocationPreviewPage = Page.verifyOnPage(StartAllocationsMigrationPreviewPage)
      allocationPreviewPage.activityStartDateRow().contains(moment().add(2, 'days').format('YYYY-MM-DD'))
    })
  })

  context('Without MIGRATE_ACTIVITIES role', () => {
    beforeEach(() => {
      cy.task('stubSignIn', { roles: ['ROLE_MIGRATE_PRISONERS'] })
      cy.signIn()
    })
    it('should not see migrate activities tile', () => {
      const indexPage = Page.verifyOnPage(IndexPage)
      indexPage.activitiesMigrationLink().should('not.exist')
    })
    it('should not be able to navigate directly to the activities migration page', () => {
      cy.visit('/activities-migration', { failOnStatusCode: false })
      Page.verifyOnPage(AuthErrorPage)
    })
  })
})
