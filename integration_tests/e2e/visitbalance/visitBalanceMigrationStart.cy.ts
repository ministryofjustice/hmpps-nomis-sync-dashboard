import IndexPage from '../../pages'
import Page from '../../pages/page'
import VisitBalanceMigrationPage from '../../pages/visit-balance-migration/visitBalanceMigration'
import StartVisitBalanceMigrationPage from '../../pages/visit-balance-migration/startVisitBalanceMigration'
import StartVisitBalanceMigrationPreviewPage from '../../pages/visit-balance-migration/startVisitBalanceMigrationPreview'
import StartVisitBalanceMigrationConfirmationPage from '../../pages/visit-balance-migration/startVisitBalanceMigrationConfirmation'
import { visitBalanceMigrationHistory } from '../../mockApis/nomisVisitBalanceMigrationApi'

context('Visit Balance Migration Start', () => {
  beforeEach(() => {
    cy.task('reset')
  })
  context('With MIGRATE_NOMIS_SYSCON role', () => {
    beforeEach(() => {
      cy.task('stubSignIn', { roles: ['ROLE_MIGRATE_NOMIS_SYSCON'] })
      cy.task('stubListOfMigrationHistory', { domain: 'visit-balance', history: visitBalanceMigrationHistory })
      cy.signIn()
      const indexPage = Page.verifyOnPage(IndexPage)
      indexPage.visitBalanceMigrationLink().click()
    })
    it('can navigate to start migration page', () => {
      Page.verifyOnPage(VisitBalanceMigrationPage).startNewMigration().click()
      Page.verifyOnPage(StartVisitBalanceMigrationPage)
    })

    it('will validate page when selecting start migration', () => {
      Page.verifyOnPage(VisitBalanceMigrationPage).startNewMigration().click()
      const page = Page.verifyOnPage(StartVisitBalanceMigrationPage)
      page.prisonId().type('invalid')

      page.continueButton().click()

      const pageWithErrors = Page.verifyOnPage(StartVisitBalanceMigrationPage)
      pageWithErrors.errorSummary().contains('The prison ID must contain 3 letters.')
    })
    it('Preview of migration will be shown and changes allowed prior to starting a migration', () => {
      cy.task('stubStartMigration', {
        domain: 'visit-balance',
        response: {
          migrationId: '2022-03-23T11:11:56',
          estimatedCount: 100_988,
        },
      })
      cy.task('stubHealth')
      cy.task('stubGetFailures', { queue: 'syscon-devs-dev-migration_visitbalance_dlq' })

      Page.verifyOnPage(VisitBalanceMigrationPage).startNewMigration().click()
      cy.task('stubGetVisitBalanceMigrationEstimatedCount', 100_988)

      const page = Page.verifyOnPage(StartVisitBalanceMigrationPage)
      page.prisonId().type('MDI')

      page.continueButton().click()
      const previewPage = Page.verifyOnPage(StartVisitBalanceMigrationPreviewPage)
      previewPage.estimateSummary().contains('Estimated number of visit balance entities to be migrated: 100,988')
      previewPage
        .dlqWarning()
        .contains(
          'There are 153 messages on the migration dead letter queue. Please clear these before starting the migration',
        )

      previewPage.prisonIdRow().contains('MDI')
      previewPage.prisonIdChangeLink().click()

      // amend the prison id
      const amendPage = Page.verifyOnPage(StartVisitBalanceMigrationPage)
      amendPage.prisonId().clear()
      amendPage.prisonId().type('DNI')
      amendPage.continueButton().click()

      // check amended date displayed
      const previewPageAgain = Page.verifyOnPage(StartVisitBalanceMigrationPreviewPage)
      previewPageAgain.prisonIdRow().contains('DNI')
      previewPageAgain.startMigrationButton().click()

      const confirmationPage = Page.verifyOnPage(StartVisitBalanceMigrationConfirmationPage)
      confirmationPage.confirmationMessage().contains('100,988')
      confirmationPage.confirmationMessage().contains('2022-03-23T11:11:56')
      confirmationPage.detailsLink().contains('View migration status')
    })
  })
})
