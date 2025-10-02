import IndexPage from '../../pages'
import Page from '../../pages/page'
import PrisonerBalanceMigrationPage from '../../pages/finance-migration/prisonerBalanceMigration'
import StartPrisonerBalanceMigrationPage from '../../pages/finance-migration/startPrisonerBalanceMigration'
import StartPrisonerBalanceMigrationPreviewPage from '../../pages/finance-migration/startPrisonerBalanceMigrationPreview'
import StartPrisonerBalanceMigrationConfirmationPage from '../../pages/finance-migration/startPrisonerBalanceMigrationConfirmation'
import prisonerBalanceMigrationHistory from '../../mockApis/nomisPrisonerBalanceMigrationApi'

context('Prisoner Balance Migration Start', () => {
  beforeEach(() => {
    cy.task('reset')
  })
  context('With MIGRATE_NOMIS_SYSCON role', () => {
    beforeEach(() => {
      cy.task('stubSignIn', { roles: ['ROLE_MIGRATE_NOMIS_SYSCON'] })
      cy.task('stubGetMigrationHistory', {
        migrationType: 'PRISONER_BALANCE',
        history: prisonerBalanceMigrationHistory,
      })
      cy.signIn()
      const indexPage = Page.verifyOnPage(IndexPage)
      indexPage.migrationLink('prisoner-balance-migration').click()
    })
    it('can navigate to start migration page', () => {
      Page.verifyOnPage(PrisonerBalanceMigrationPage).startNewMigration().click()
      Page.verifyOnPage(StartPrisonerBalanceMigrationPage)
    })

    it('will validate page when selecting start migration', () => {
      Page.verifyOnPage(PrisonerBalanceMigrationPage).startNewMigration().click()
      const page = Page.verifyOnPage(StartPrisonerBalanceMigrationPage)
      page.prisonId().type('invalid')

      page.continueButton().click()

      const pageWithErrors = Page.verifyOnPage(StartPrisonerBalanceMigrationPage)
      pageWithErrors.errorSummary().contains('The prison ID must contain 3 letters')
    })

    it('will ensure prison id is optional when selecting start migration', () => {
      cy.task('stubStartMigration', {
        domain: 'prisoner-balance',
        response: {
          migrationId: '2022-03-23T11:11:56',
          estimatedCount: 100_988,
        },
      })
      cy.task('stubGetFailureCountWithMigrationType', { migrationType: 'PRISONER_BALANCE' })
      cy.task('stubGetNoFailuresWithMigrationType', { migrationType: 'PRISONER_BALANCE' })
      cy.task('stubGetPrisonerBalanceMigrationEstimatedCount', 100_988)

      Page.verifyOnPage(PrisonerBalanceMigrationPage).startNewMigration().click()
      const page = Page.verifyOnPage(StartPrisonerBalanceMigrationPage)

      page.continueButton().click()

      const previewPage = Page.verifyOnPage(StartPrisonerBalanceMigrationPreviewPage)
      previewPage.estimateSummary().contains('Estimated number of prisoner balance entities to be migrated: 100,988')
    })

    it('Preview of migration will be shown and changes allowed prior to starting a migration', () => {
      cy.task('stubStartMigration', {
        domain: 'prisoner-balance',
        response: {
          migrationId: '2022-03-23T11:11:56',
          estimatedCount: 100_988,
        },
      })
      cy.task('stubGetFailureCountWithMigrationType', { migrationType: 'PRISONER_BALANCE' })
      cy.task('stubGetFailuresWithMigrationType', { migrationType: 'PRISONER_BALANCE' })

      Page.verifyOnPage(PrisonerBalanceMigrationPage).startNewMigration().click()
      cy.task('stubGetPrisonerBalanceMigrationEstimatedCount', 100_988)

      const page = Page.verifyOnPage(StartPrisonerBalanceMigrationPage)
      page.prisonId().type('MDI')

      page.continueButton().click()
      const previewPage = Page.verifyOnPage(StartPrisonerBalanceMigrationPreviewPage)
      previewPage.estimateSummary().contains('Estimated number of prisoner balance entities to be migrated: 100,988')
      previewPage
        .dlqWarning()
        .contains(
          'There are 153 messages on the migration dead letter queue. Please clear these before starting the migration',
        )

      previewPage.prisonIdRow().contains('MDI')
      previewPage.prisonIdChangeLink().click()

      // amend the prison id
      const amendPage = Page.verifyOnPage(StartPrisonerBalanceMigrationPage)
      amendPage.prisonId().clear()
      amendPage.prisonId().type('DNI')
      amendPage.continueButton().click()

      // check amended date displayed
      const previewPageAgain = Page.verifyOnPage(StartPrisonerBalanceMigrationPreviewPage)
      previewPageAgain.prisonIdRow().contains('DNI')
      previewPageAgain.startMigrationButton().click()

      const confirmationPage = Page.verifyOnPage(StartPrisonerBalanceMigrationConfirmationPage)
      confirmationPage.confirmationMessage().contains('100,988')
      confirmationPage.confirmationMessage().contains('2022-03-23T11:11:56')
      confirmationPage.detailsLink().contains('View migration status')
    })
  })
})
