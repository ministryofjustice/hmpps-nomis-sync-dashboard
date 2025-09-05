import IndexPage from '../pages/index'
import Page from '../pages/page'
import AuthErrorPage from '../pages/authError'
import StartMovementsMigrationPage from '../pages/movements-migration/startMovementsMigration'
import StartMovementsMigrationPreviewPage from '../pages/movements-migration/startMovementsMigrationPreview'
import MovementsMigrationPage from '../pages/movements-migration/movementsMigration'
import StartMovementsMigrationConfirmationPage from '../pages/movements-migration/startMovementsMigrationConfirmation'

context('Movements Migration Start', () => {
  beforeEach(() => {
    cy.task('reset')
  })
  context('With MIGRATE_NOMIS_SYSCON role', () => {
    beforeEach(() => {
      cy.task('stubSignIn', { roles: ['ROLE_MIGRATE_NOMIS_SYSCON'] })
      cy.task('stubGetMigrationHistory', { migrationType: 'EXTERNAL_MOVEMENTS' })
      cy.signIn()
      const indexPage = Page.verifyOnPage(IndexPage)
      indexPage.movementsBalanceMigrationLink().click()
    })
    it('can navigate to start migration page', () => {
      Page.verifyOnPage(MovementsMigrationPage).startNewMigration().click()
      Page.verifyOnPage(StartMovementsMigrationPage)
    })
    it('Preview of migration will be shown and changes allowed prior to starting a migration', () => {
      cy.task('stubStartMigration', {
        domain: 'external-movements',
        response: {
          migrationId: '2022-03-23T11:11:56',
          estimatedCount: 100_988,
        },
      })
      cy.task('stubGetFailureCountWithMigrationType', { migrationType: 'EXTERNAL_MOVEMENTS' })
      cy.task('stubGetFailuresWithMigrationType', { migrationType: 'EXTERNAL_MOVEMENTS' })

      Page.verifyOnPage(MovementsMigrationPage).startNewMigration().click()
      cy.task('stubGetPrisonersMigrationEstimatedCount', 100_988)

      const page = Page.verifyOnPage(StartMovementsMigrationPage)
      page.prisonerNumber().type('A1234BC')

      page.continueButton().click()
      const previewPage = Page.verifyOnPage(StartMovementsMigrationPreviewPage)
      previewPage.estimateSummary().contains('Estimated number of prisoners to be migrated: 1')
      previewPage
        .dlqWarning()
        .contains(
          'There are 153 messages on the migration dead letter queue. Please clear these before starting the migration',
        )

      previewPage.prisonerRow().contains('A1234BC')
      previewPage.prisonerChangeLink().click()

      const amendPage = Page.verifyOnPage(StartMovementsMigrationPage)
      amendPage.prisonerNumber().clear()
      amendPage.continueButton().click()

      // check amended date displayed
      const previewPageAgain = Page.verifyOnPage(StartMovementsMigrationPreviewPage)
      previewPageAgain.estimateSummary().contains('Estimated number of prisoners to be migrated: 100,988')
      previewPageAgain.startMigrationButton().click()

      const confirmationPage = Page.verifyOnPage(StartMovementsMigrationConfirmationPage)
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
    it('should not see migrate movements tile', () => {
      const indexPage = Page.verifyOnPage(IndexPage)
      indexPage.movementsBalanceMigrationLink().should('not.exist')
    })
    it('should not be able to navigate directly to the movements migration page', () => {
      cy.visit('/movements-migration', { failOnStatusCode: false })
      Page.verifyOnPage(AuthErrorPage)
    })
  })
})
