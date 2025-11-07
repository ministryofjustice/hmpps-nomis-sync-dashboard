import IndexPage from '../pages/index'
import Page from '../pages/page'
import VisitslotsMigrationPage from '../pages/visitslots-migration/visitslotsMigration'
import StartVisitslotsMigrationPage from '../pages/visitslots-migration/startVisitslotsMigration'
import StartVisitslotsMigrationPreviewPage from '../pages/visitslots-migration/startVisitslotsMigrationPreview'
import StartVisitslotsMigrationConfirmationPage from '../pages/visitslots-migration/startVisitslotsMigrationConfirmation'
import AuthErrorPage from '../pages/authError'

context('Visit Time Slots Migration Start', () => {
  beforeEach(() => {
    cy.task('reset')
  })
  context('With MIGRATE_NOMIS_SYSCON role', () => {
    beforeEach(() => {
      cy.task('stubSignIn', { roles: ['ROLE_MIGRATE_NOMIS_SYSCON'] })
      cy.task('stubGetMigrationHistory', { migrationType: 'VISIT_SLOTS' })
      cy.signIn()
      const indexPage = Page.verifyOnPage(IndexPage)
      indexPage.visitslotsMigrationLink().click()
    })
    it('can navigate to start migration page', () => {
      Page.verifyOnPage(VisitslotsMigrationPage).startNewMigration().click()
      Page.verifyOnPage(StartVisitslotsMigrationPage)
    })

    it('Preview of migration will be shown and changes allowed prior to starting a migration', () => {
      cy.task('stubStartMigration', {
        domain: 'visitslots',
        response: {
          migrationId: '2022-03-23T11:11:56',
          estimatedCount: 100_988,
        },
      })
      cy.task('stubGetFailureCountWithMigrationType', { migrationType: 'VISIT_SLOTS' })
      cy.task('stubGetFailuresWithMigrationType', { migrationType: 'VISIT_SLOTS' })

      Page.verifyOnPage(VisitslotsMigrationPage).startNewMigration().click()
      cy.task('stubGetVisitslotsMigrationEstimatedCount', 100_988)

      const page = Page.verifyOnPage(StartVisitslotsMigrationPage)

      page.continueButton().click()
      const previewPage = Page.verifyOnPage(StartVisitslotsMigrationPreviewPage)
      previewPage.estimateSummary().contains('Estimated number of Visit Time Slots entities to be migrated: 100,988')
      previewPage
        .dlqWarning()
        .contains(
          'There are 153 messages on the migration dead letter queue. Please clear these before starting the migration',
        )

      previewPage.startMigrationButton().click()

      const confirmationPage = Page.verifyOnPage(StartVisitslotsMigrationConfirmationPage)
      confirmationPage.confirmationMessage().contains('100,988')
      confirmationPage.confirmationMessage().contains('2022-03-23T11:11:56')
      confirmationPage.detailsLink().contains('View migration status')
    })
  })

  context('Without MIGRATE_NOMIS_SYSCON role', () => {
    beforeEach(() => {
      cy.task('stubSignIn', { roles: ['ROLE_MIGRATE_PRISONERS'] })
      cy.signIn()
    })
    it('should not see migrate visit slots tile', () => {
      const indexPage = Page.verifyOnPage(IndexPage)
      indexPage.visitslotsMigrationLink().should('not.exist')
    })
    it('should not be able to navigate directly to the visit slots migration page', () => {
      cy.visit('/visitslots-migration', { failOnStatusCode: false })
      Page.verifyOnPage(AuthErrorPage)
    })
  })
})
