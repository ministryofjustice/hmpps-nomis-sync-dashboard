import IndexPage from '../../pages'
import Page from '../../pages/page'
import PrisonBalanceMigrationPage from '../../pages/finance-migration/prisonBalanceMigration'
import StartPrisonBalanceMigrationPage from '../../pages/finance-migration/startPrisonBalanceMigration'
import StartPrisonBalanceMigrationPreviewPage from '../../pages/finance-migration/startPrisonBalanceMigrationPreview'
import StartPrisonBalanceMigrationConfirmationPage from '../../pages/finance-migration/startPrisonBalanceMigrationConfirmation'
import prisonBalanceMigrationHistory from '../../mockApis/nomisPrisonBalanceMigrationApi'

context('Prison Balance Migration Start', () => {
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
      const indexPage = Page.verifyOnPage(IndexPage)
      indexPage.migrationLink('prison-balance-migration').click()
    })
    it('can navigate to start migration page', () => {
      Page.verifyOnPage(PrisonBalanceMigrationPage).startNewMigration().click()
      Page.verifyOnPage(StartPrisonBalanceMigrationPage)
    })

    it('will validate page when selecting start migration', () => {
      Page.verifyOnPage(PrisonBalanceMigrationPage).startNewMigration().click()
      const page = Page.verifyOnPage(StartPrisonBalanceMigrationPage)
      page.prisonId().type('invalid')

      page.continueButton().click()

      const pageWithErrors = Page.verifyOnPage(StartPrisonBalanceMigrationPage)
      pageWithErrors.errorSummary().contains('The prison ID must contain 3 letters')
    })

    it('will ensure prison id is optional when selecting start migration', () => {
      cy.task('stubStartMigration', {
        domain: 'prison-balance',
        response: {
          migrationId: '2022-03-23T11:11:56',
          estimatedCount: 100_988,
        },
      })
      cy.task('stubGetFailureCountWithMigrationType', { migrationType: 'PRISON_BALANCE' })
      cy.task('stubGetNoFailuresWithMigrationType', { migrationType: 'PRISON_BALANCE' })
      cy.task('stubGetPrisonBalanceMigrationEstimatedCount', 100_988)

      Page.verifyOnPage(PrisonBalanceMigrationPage).startNewMigration().click()
      const page = Page.verifyOnPage(StartPrisonBalanceMigrationPage)

      page.continueButton().click()

      const previewPage = Page.verifyOnPage(StartPrisonBalanceMigrationPreviewPage)
      previewPage.estimateSummary().contains('Estimated number of prison balance entities to be migrated: 100,988')
    })

    it('Preview of migration will be shown and changes allowed prior to starting a migration', () => {
      cy.task('stubStartMigration', {
        domain: 'prison-balance',
        response: {
          migrationId: '2022-03-23T11:11:56',
          estimatedCount: 100_988,
        },
      })
      cy.task('stubGetFailureCountWithMigrationType', { migrationType: 'PRISON_BALANCE' })
      cy.task('stubGetFailuresWithMigrationType', { migrationType: 'PRISON_BALANCE' })

      Page.verifyOnPage(PrisonBalanceMigrationPage).startNewMigration().click()
      cy.task('stubGetPrisonBalanceMigrationEstimatedCount', 100_988)

      const page = Page.verifyOnPage(StartPrisonBalanceMigrationPage)
      page.prisonId().type('MDI')

      page.continueButton().click()
      const previewPage = Page.verifyOnPage(StartPrisonBalanceMigrationPreviewPage)
      previewPage.estimateSummary().contains('Estimated number of prison balance entities to be migrated: 1')
      previewPage
        .dlqWarning()
        .contains(
          'There are 153 messages on the migration dead letter queue. Please clear these before starting the migration',
        )

      previewPage.prisonIdRow().contains('MDI')
      previewPage.prisonIdChangeLink().click()

      // amend the prison id
      const amendPage = Page.verifyOnPage(StartPrisonBalanceMigrationPage)
      amendPage.prisonId().clear()
      amendPage.prisonId().type('DNI')
      amendPage.continueButton().click()

      // check amended date displayed
      const previewPageAgain = Page.verifyOnPage(StartPrisonBalanceMigrationPreviewPage)
      previewPageAgain.prisonIdRow().contains('DNI')
      previewPageAgain.startMigrationButton().click()

      const confirmationPage = Page.verifyOnPage(StartPrisonBalanceMigrationConfirmationPage)
      confirmationPage.confirmationMessage().contains('100,988')
      confirmationPage.confirmationMessage().contains('2022-03-23T11:11:56')
      confirmationPage.detailsLink().contains('View migration status')
    })
  })
})
