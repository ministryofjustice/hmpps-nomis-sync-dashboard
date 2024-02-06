import IndexPage from '../pages/index'
import Page from '../pages/page'
import StartVisitsMigrationPage from '../pages/visits-migration/startVisitsMigration'
import StartVisitsMigrationConfirmationPage from '../pages/visits-migration/startVisitsMigrationConfirmation'
import StartVisitsMigrationPreviewPage from '../pages/visits-migration/startVisitsMigrationPreview'
import VisitsMigrationPage from '../pages/visits-migration/visitsMigration'

context('Start Visits Migration', () => {
  beforeEach(() => {
    cy.task('reset')
    cy.task('stubManageUser')
  })
  context('With MIGRATE_VISITS role', () => {
    beforeEach(() => {
      cy.task('stubSignIn', ['ROLE_MIGRATE_VISITS'])
      cy.task('stubListOfVisitsMigrationHistory')
      cy.signIn()
      const indexPage = Page.verifyOnPage(IndexPage)
      indexPage.visitsMigrationLink().click()
    })
    it('can navigate to start migration page', () => {
      Page.verifyOnPage(VisitsMigrationPage).startNewMigration().click()
      Page.verifyOnPage(StartVisitsMigrationPage)
    })

    it('will validate page when selecting start migration', () => {
      Page.verifyOnPage(VisitsMigrationPage).startNewMigration().click()
      const page = Page.verifyOnPage(StartVisitsMigrationPage)
      page.prisonIds().clear()
      page.fromDateTime().type('invalid')
      page.toDateTime().type('invalid')

      page.continueButton().click()

      const pageWithErrors = Page.verifyOnPage(StartVisitsMigrationPage)
      pageWithErrors.errorSummary().contains('Enter the type of visits to migrate')
      pageWithErrors.errorSummary().contains('Enter one or more prison IDs')
      pageWithErrors.errorSummary().contains('Enter a real date time, like 2020-03-23T12:00:00 or 2020-03-23')
    })

    it('Preview of migration will be shown and changes allowed prior to starting a migration', () => {
      cy.task('stubStartVisitsMigration', {
        migrationId: '2022-03-23T11:11:56',
        estimatedCount: 100_988,
      })
      cy.task('stubHealth')
      cy.task('stubGetVisitsFailures')

      Page.verifyOnPage(VisitsMigrationPage).startNewMigration().click()
      cy.task('stubGetVisitMigrationEstimatedCount', 100_988)
      cy.task('stubGetVisitMigrationRoomUsage', 100_988)

      const page = Page.verifyOnPage(StartVisitsMigrationPage)
      page.prisonIds().type('HEI')
      page.fromDateTime().type('2020-03-23T12:00:00')
      page.toDateTime().type('2020-03-30T10:00:00')
      page.socialVisitType().click()

      page.continueButton().click()
      const previewPage = Page.verifyOnPage(StartVisitsMigrationPreviewPage)
      previewPage.estimateSummary().contains('Estimated number of visits to be migrated: 100,988')
      previewPage
        .dlqWarning()
        .contains(
          'There are 153 messages on the migration dead letter queue. Please clear these before starting the migration',
        )

      previewPage
        .roomsWarning()
        .contains(
          'This migration includes visits rooms that are not mapped. Please add mappings for the following rooms:',
        )
      previewPage.roomsWarning().should('not.contains.text', 'AGI-VISITS-OFF_VIS')
      previewPage.roomsWarning().should('contains.text', 'AGI-VISITS-SOC_VIS')
      previewPage.roomsWarning().should('contains.text', '14314')
      previewPage.roomsWarning().should('not.contains.text', 'AKI-VISITS-3RD SECTOR')

      previewPage.fromDateTimeRow().contains('2020-03-23T12:00:00')
      previewPage.fromDateTimeChangeLink().click()

      // amend the from date
      const amendPage = Page.verifyOnPage(StartVisitsMigrationPage)
      amendPage.fromDateTime().clear()
      amendPage.fromDateTime().type('2020-03-20T12:00:00')
      page.continueButton().click()

      // check amended date displayed
      const previewPageAgain = Page.verifyOnPage(StartVisitsMigrationPreviewPage)
      previewPageAgain.fromDateTimeRow().contains('2020-03-20T12:00:00')
      previewPageAgain.startMigrationButton().click()

      const confirmationPage = Page.verifyOnPage(StartVisitsMigrationConfirmationPage)
      confirmationPage.confirmationMessage().contains('100,988')
      confirmationPage.confirmationMessage().contains('2022-03-23T11:11:56')
      confirmationPage.detailsLink().contains('View migration status')
    })
    it('Can clear DLQ when there are message still present', () => {
      cy.task('stubStartVisitsMigration', {
        migrationId: '2022-03-23T11:11:56',
        estimatedCount: 100_988,
      })
      cy.task('stubHealth')
      cy.task('stubGetVisitsFailures')
      cy.task('stubDeleteVisitsFailures')

      Page.verifyOnPage(VisitsMigrationPage).startNewMigration().click()
      cy.task('stubGetVisitMigrationEstimatedCount', 100_988)
      cy.task('stubGetVisitMigrationRoomUsage', 100_988)

      const page = Page.verifyOnPage(StartVisitsMigrationPage)
      page.prisonIds().type('HEI')
      page.fromDateTime().type('2020-03-23T12:00:00')
      page.toDateTime().type('2020-03-30T10:00:00')
      page.socialVisitType().click()

      page.continueButton().click()
      const previewPage = Page.verifyOnPage(StartVisitsMigrationPreviewPage)
      previewPage.estimateSummary().contains('Estimated number of visits to be migrated: 100,988')
      previewPage
        .dlqWarning()
        .contains(
          'There are 153 messages on the migration dead letter queue. Please clear these before starting the migration',
        )

      previewPage.clearDlqMessages().click()

      const previewPageAgain = Page.verifyOnPage(StartVisitsMigrationPreviewPage)
      previewPageAgain.startMigrationButton().click()

      Page.verifyOnPage(StartVisitsMigrationConfirmationPage)
    })
  })
})
