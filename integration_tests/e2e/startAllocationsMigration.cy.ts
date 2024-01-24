import IndexPage from '../pages/index'
import Page from '../pages/page'
import StartAllocationsMigrationPage from '../pages/allocations-migration/startAllocationsMigration'
import StartAllocationsMigrationConfirmationPage from '../pages/allocations-migration/startAllocationsMigrationConfirmation'
import StartAllocationsMigrationPreviewPage from '../pages/allocations-migration/startAllocationsMigrationPreview'
import AllocationsMigrationPage from '../pages/allocations-migration/allocationsMigration'

context('Start Allocations Migration', () => {
  beforeEach(() => {
    cy.task('reset')
    cy.task('stubManageUser')
    cy.task('stubGetActivityCategories')
  })
  context('With MIGRATE_ACTIVITIES role', () => {
    beforeEach(() => {
      cy.task('stubSignIn', ['ROLE_MIGRATE_ACTIVITIES'])
      cy.task('stubListOfAllocationsMigrationHistory')
      cy.signIn()
      const indexPage = Page.verifyOnPage(IndexPage)
      indexPage.allocationsMigrationLink().click()
    })
    it('can navigate to start migration page', () => {
      Page.verifyOnPage(AllocationsMigrationPage).startNewMigration().click()
      Page.verifyOnPage(StartAllocationsMigrationPage)
    })

    it('will validate page when selecting start migration', () => {
      Page.verifyOnPage(AllocationsMigrationPage).startNewMigration().click()
      const page = Page.verifyOnPage(StartAllocationsMigrationPage)
      page.prisonId().clear()
      page.courseActivityId().type('invalid')

      page.continueButton().click()

      const pageWithErrors = Page.verifyOnPage(StartAllocationsMigrationPage)
      pageWithErrors.errorSummary().contains('Enter a prison ID')
      pageWithErrors.errorSummary().contains('The Course Activity ID must be an integer')
    })

    it('Preview of migration will be shown and changes allowed prior to starting a migration', () => {
      cy.task('stubStartAllocationsMigration', {
        migrationId: '2022-03-23T11:11:56',
        estimatedCount: 100_988,
      })
      cy.task('stubHealth')
      cy.task('stubGetAllocationsFailures')

      Page.verifyOnPage(AllocationsMigrationPage).startNewMigration().click()
      cy.task('stubGetAllocationsMigrationEstimatedCount', 100_988)

      const page = Page.verifyOnPage(StartAllocationsMigrationPage)
      page.prisonId().type('MDI')
      page.courseActivityId().type('123456')

      page.continueButton().click()
      const previewPage = Page.verifyOnPage(StartAllocationsMigrationPreviewPage)
      previewPage.estimateSummary().contains('Estimated number of Allocations entities to be migrated: 100,988')
      previewPage
        .dlqWarning()
        .contains(
          'There are 153 messages on the migration dead letter queue. Please clear these before starting the migration',
        )

      previewPage.prisonIdRow().contains('MDI')
      previewPage.courseActivityIdRow().contains('123456')
      previewPage.prisonIdChangeLink().click()

      // amend the from date
      const amendPage = Page.verifyOnPage(StartAllocationsMigrationPage)
      amendPage.prisonId().clear().type('LEI')
      amendPage.courseActivityId().clear().type('333333')
      page.continueButton().click()

      // check amended date displayed
      const previewPageAgain = Page.verifyOnPage(StartAllocationsMigrationPreviewPage)
      previewPageAgain.prisonIdRow().contains('LEI')
      previewPageAgain.courseActivityIdRow().contains('333333')
      previewPageAgain.startMigrationButton().click()

      const confirmationPage = Page.verifyOnPage(StartAllocationsMigrationConfirmationPage)
      confirmationPage.confirmationMessage().contains('100,988')
      confirmationPage.confirmationMessage().contains('2022-03-23T11:11:56')
      confirmationPage.detailsLink().contains('View migration status')
    })

    it('Can clear DLQ when there are message still present', () => {
      cy.task('stubStartAllocationsMigration', {
        migrationId: '2022-03-23T11:11:56',
        estimatedCount: 100_988,
      })
      cy.task('stubHealth')
      cy.task('stubGetAllocationsFailures')
      cy.task('stubDeleteAllocationsFailures')

      Page.verifyOnPage(AllocationsMigrationPage).startNewMigration().click()
      cy.task('stubGetAllocationsMigrationEstimatedCount', 100_988)

      const page = Page.verifyOnPage(StartAllocationsMigrationPage)
      page.prisonId().type('MDI')

      page.continueButton().click()
      const previewPage = Page.verifyOnPage(StartAllocationsMigrationPreviewPage)
      previewPage.estimateSummary().contains('Estimated number of Allocations entities to be migrated: 100,988')
      previewPage
        .dlqWarning()
        .contains(
          'There are 153 messages on the migration dead letter queue. Please clear these before starting the migration',
        )

      previewPage.clearDlqMessages().click()

      const previewPageAgain = Page.verifyOnPage(StartAllocationsMigrationPreviewPage)
      previewPageAgain.startMigrationButton().click()

      Page.verifyOnPage(StartAllocationsMigrationConfirmationPage)
    })
  })
})
