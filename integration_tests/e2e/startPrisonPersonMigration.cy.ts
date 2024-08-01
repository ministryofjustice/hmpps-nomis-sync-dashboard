import IndexPage from '../pages/index'
import Page from '../pages/page'
import PrisonPersonMigrationPage from '../pages/prisonperson/prisonPersonMigration'
import StartPrisonPersonMigrationPage from '../pages/prisonperson/startPrisonPersonMigration'
import StartPrisonPersonMigrationPreviewPage from '../pages/prisonperson/startPrisonPersonMigrationPreview'
import StartPrisonPersonMigrationConfirmationPage from '../pages/prisonperson/startPrisonPersonMigrationConfirmation'

context('Start Prison Person Migration', () => {
  beforeEach(() => {
    cy.task('reset')
  })
  context('With MIGRATE_PRISONPERSON role', () => {
    beforeEach(() => {
      cy.task('stubSignIn', { roles: ['ROLE_MIGRATE_PRISONPERSON'] })
      cy.task('stubListOfPrisonPersonMigrationHistory')
      cy.signIn()
      const indexPage = Page.verifyOnPage(IndexPage)
      indexPage.prisonPersonMigrationLink().click()
    })
    it('can navigate to start migration page', () => {
      Page.verifyOnPage(PrisonPersonMigrationPage).startNewMigration().click()
      Page.verifyOnPage(StartPrisonPersonMigrationPage)
    })

    it('Preview of migration will be shown and changes allowed prior to starting a migration', () => {
      cy.task('stubStartPrisonPersonMigration', {
        migrationId: '2022-03-23T11:11:56',
        estimatedCount: 100_988,
      })
      cy.task('stubHealth')
      cy.task('stubGetPrisonPersonFailures')

      Page.verifyOnPage(PrisonPersonMigrationPage).startNewMigration().click()
      cy.task('stubGetPrisonPersonMigrationEstimatedCount', 100_988)

      const page = Page.verifyOnPage(StartPrisonPersonMigrationPage)
      page.prisonerNumber().type('A1234BC')

      page.continueButton().click()
      const previewPage = Page.verifyOnPage(StartPrisonPersonMigrationPreviewPage)
      previewPage.estimateSummary().contains('Estimated number of Prison Person entities to be migrated: 1')
      previewPage
        .dlqWarning()
        .contains(
          'There are 153 messages on the migration dead letter queue. Please clear these before starting the migration',
        )

      previewPage.prisonerNumberRow().contains('A1234BC')
      previewPage.prisonerNumberChangeLink().click()

      // remove the prisoner number
      const amendPage = Page.verifyOnPage(StartPrisonPersonMigrationPage)
      amendPage.prisonerNumber().clear()
      page.continueButton().click()

      // check amended prisoner number displayed
      const previewPageAgain = Page.verifyOnPage(StartPrisonPersonMigrationPreviewPage)
      previewPageAgain.startMigrationButton().click()

      const confirmationPage = Page.verifyOnPage(StartPrisonPersonMigrationConfirmationPage)
      confirmationPage.confirmationMessage().contains('100,988')
      confirmationPage.confirmationMessage().contains('2022-03-23T11:11:56')
      confirmationPage.detailsLink().contains('View migration status')
    })

    it('Can clear DLQ when there are message still present', () => {
      cy.task('stubStartPrisonPersonMigration', {
        migrationId: '2022-03-23T11:11:56',
        estimatedCount: 100_988,
      })
      cy.task('stubHealth')
      cy.task('stubGetPrisonPersonFailures')
      cy.task('stubDeletePrisonPersonFailures')

      Page.verifyOnPage(PrisonPersonMigrationPage).startNewMigration().click()
      cy.task('stubGetPrisonPersonMigrationEstimatedCount', 100_988)

      const page = Page.verifyOnPage(StartPrisonPersonMigrationPage)

      page.continueButton().click()
      const previewPage = Page.verifyOnPage(StartPrisonPersonMigrationPreviewPage)
      previewPage.estimateSummary().contains('Estimated number of Prison Person entities to be migrated: 100,988')
      previewPage
        .dlqWarning()
        .contains(
          'There are 153 messages on the migration dead letter queue. Please clear these before starting the migration',
        )

      previewPage.clearDlqMessages().click()

      const previewPageAgain = Page.verifyOnPage(StartPrisonPersonMigrationPreviewPage)
      previewPageAgain.startMigrationButton().click()

      Page.verifyOnPage(StartPrisonPersonMigrationConfirmationPage)
    })
  })
})
