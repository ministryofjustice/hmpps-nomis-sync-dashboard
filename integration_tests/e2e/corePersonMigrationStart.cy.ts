import IndexPage from '../pages/index'
import Page from '../pages/page'
import CorePersonMigrationPage from '../pages/coreperson-migration/corePersonMigration'
import StartCorePersonMigrationPage from '../pages/coreperson-migration/startCorePersonMigration'
import StartCorePersonMigrationPreviewPage from '../pages/coreperson-migration/startCorePersonMigrationPreview'
import StartCorePersonMigrationConfirmationPage from '../pages/coreperson-migration/startCorePersonMigrationConfirmation'
import AuthErrorPage from '../pages/authError'

const migrationType: string = 'CORE_PERSON'

context('Core Person Migration Start', () => {
  beforeEach(() => {
    cy.task('reset')
  })
  context('With MIGRATE_CORE_PERSON role', () => {
    beforeEach(() => {
      cy.task('stubSignIn', { roles: ['ROLE_MIGRATE_CORE_PERSON'] })
      cy.task('stubGetMigrationHistory', { migrationType })
      cy.signIn()
      const indexPage = Page.verifyOnPage(IndexPage)
      indexPage.migrationLink('coreperson-migration').click()
    })
    it('can navigate to start migration page', () => {
      Page.verifyOnPage(CorePersonMigrationPage).startNewMigration().click()
      Page.verifyOnPage(StartCorePersonMigrationPage)
    })

    it('Preview of migration will be shown prior to starting a migration', () => {
      cy.task('stubStartMigration', {
        domain: 'core-person',
        response: {
          migrationId: '2022-03-23T11:11:56',
          estimatedCount: 100_988,
        },
      })
      cy.task('stubGetFailureCountWithMigrationType', { migrationType })
      cy.task('stubGetFailuresWithMigrationType', { migrationType })

      Page.verifyOnPage(CorePersonMigrationPage).startNewMigration().click()
      cy.task('stubGetPrisonersMigrationEstimatedCount', 100_988)

      const page = Page.verifyOnPage(StartCorePersonMigrationPage)

      page.continueButton().click()
      const previewPage = Page.verifyOnPage(StartCorePersonMigrationPreviewPage)
      previewPage.estimateSummary().contains('Estimated number of Person entities to be migrated: 100,988')
      previewPage
        .dlqWarning()
        .contains(
          'There are 153 messages on the migration dead letter queue. Please clear these before starting the migration',
        )

      previewPage.startMigrationButton().click()

      const confirmationPage = Page.verifyOnPage(StartCorePersonMigrationConfirmationPage)
      confirmationPage.confirmationMessage().contains('100,988')
      confirmationPage.confirmationMessage().contains('2022-03-23T11:11:56')
      confirmationPage.detailsLink().contains('View migration status')
    })
  })

  context('With MIGRATE_NOMIS_SYSCON role', () => {
    beforeEach(() => {
      cy.task('stubSignIn', { roles: ['ROLE_MIGRATE_NOMIS_SYSCON'] })
      cy.task('stubGetMigrationHistory', { migrationType })
      cy.signIn()
      const indexPage = Page.verifyOnPage(IndexPage)
      indexPage.migrationLink('coreperson-migration').click()
    })

    it('can migrate', () => {
      cy.task('stubStartMigration', {
        domain: 'core-person',
        response: {
          migrationId: '2022-03-23T11:11:56',
          estimatedCount: 100_988,
        },
      })
      cy.task('stubGetFailureCountWithMigrationType', { migrationType })

      Page.verifyOnPage(CorePersonMigrationPage).startNewMigration().click()
      cy.task('stubGetPrisonersMigrationEstimatedCount', 100_988)

      Page.verifyOnPage(StartCorePersonMigrationPage).continueButton().click()
      Page.verifyOnPage(StartCorePersonMigrationPreviewPage).startMigrationButton().click()
      Page.verifyOnPage(StartCorePersonMigrationConfirmationPage)
    })
  })

  context('Without MIGRATE_NOMIS_SYSCON role', () => {
    beforeEach(() => {
      cy.task('stubSignIn', { roles: ['ROLE_MIGRATE_PRISONERS'] })
      cy.signIn()
    })
    it('should not see migrate contact person tile', () => {
      const indexPage = Page.verifyOnPage(IndexPage)
      indexPage.migrationLink('coreperson-migration').should('not.exist')
    })
    it('should not be able to navigate directly to the core person migration page', () => {
      cy.visit('/coreperson-migration', { failOnStatusCode: false })
      Page.verifyOnPage(AuthErrorPage)
    })
  })
})
