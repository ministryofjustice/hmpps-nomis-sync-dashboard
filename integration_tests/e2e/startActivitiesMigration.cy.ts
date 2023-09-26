import IndexPage from '../pages/index'
import Page from '../pages/page'
import StartActivitiesMigrationPage from '../pages/activities-migration/startActivitiesMigration'
import StartActivitiesMigrationConfirmationPage from '../pages/activities-migration/startActivitiesMigrationConfirmation'
import StartActivitiesMigrationPreviewPage from '../pages/activities-migration/startActivitiesMigrationPreview'
import ActivitiesMigrationPage from '../pages/activities-migration/activitiesMigration'

context('Start Activities Migration', () => {
  beforeEach(() => {
    cy.task('reset')
    cy.task('stubAuthUser')
  })
  context('With MIGRATE_ACTIVITIES role', () => {
    beforeEach(() => {
      cy.task('stubSignIn', ['ROLE_MIGRATE_ACTIVITIES'])
      cy.task('stubListOfActivitiesMigrationHistory')
      cy.signIn()
      const indexPage = Page.verifyOnPage(IndexPage)
      indexPage.activitiesMigrationLink().click()
    })
    it('can navigate to start migration page', () => {
      Page.verifyOnPage(ActivitiesMigrationPage).startNewMigration().click()
      Page.verifyOnPage(StartActivitiesMigrationPage)
    })

    it('will validate page when selecting start migration', () => {
      Page.verifyOnPage(ActivitiesMigrationPage).startNewMigration().click()
      const page = Page.verifyOnPage(StartActivitiesMigrationPage)
      page.prisonId().clear()
      page.courseActivityId().type('invalid')

      page.continueButton().click()

      const pageWithErrors = Page.verifyOnPage(StartActivitiesMigrationPage)
      pageWithErrors.errorSummary().contains('Enter a prison ID')
      pageWithErrors.errorSummary().contains('The Course Activity ID must be an integer')
    })

    it('Preview of migration will be shown and changes allowed prior to starting a migration', () => {
      cy.task('stubStartActivitiesMigration', {
        migrationId: '2022-03-23T11:11:56',
        estimatedCount: 100_988,
      })
      cy.task('stubHealth')
      cy.task('stubGetActivitiesFailures')

      Page.verifyOnPage(ActivitiesMigrationPage).startNewMigration().click()
      cy.task('stubGetActivitiesMigrationEstimatedCount', 100_988)

      const page = Page.verifyOnPage(StartActivitiesMigrationPage)
      page.prisonId().type('MDI')
      page.courseActivityId().type('123456')

      page.continueButton().click()
      const previewPage = Page.verifyOnPage(StartActivitiesMigrationPreviewPage)
      previewPage.estimateSummary().contains('Estimated number of Activities entities to be migrated: 100,988')
      previewPage
        .dlqWarning()
        .contains(
          'There are 153 messages on the migration dead letter queue. Please clear these before starting the migration',
        )

      previewPage.prisonIdRow().contains('MDI')
      previewPage.courseActivityIdRow().contains('123456')
      previewPage.prisonIdChangeLink().click()

      // amend the from date
      const amendPage = Page.verifyOnPage(StartActivitiesMigrationPage)
      amendPage.prisonId().clear().type('LEI')
      amendPage.courseActivityId().clear().type('333333')
      page.continueButton().click()

      // check amended date displayed
      const previewPageAgain = Page.verifyOnPage(StartActivitiesMigrationPreviewPage)
      previewPageAgain.prisonIdRow().contains('LEI')
      previewPageAgain.courseActivityIdRow().contains('333333')
      previewPageAgain.startMigrationButton().click()

      const confirmationPage = Page.verifyOnPage(StartActivitiesMigrationConfirmationPage)
      confirmationPage.confirmationMessage().contains('100,988')
      confirmationPage.confirmationMessage().contains('2022-03-23T11:11:56')
      confirmationPage.detailsLink().contains('View migration status')
    })

    it('Can clear DLQ when there are message still present', () => {
      cy.task('stubStartActivitiesMigration', {
        migrationId: '2022-03-23T11:11:56',
        estimatedCount: 100_988,
      })
      cy.task('stubHealth')
      cy.task('stubGetActivitiesFailures')
      cy.task('stubDeleteActivitiesFailures')

      Page.verifyOnPage(ActivitiesMigrationPage).startNewMigration().click()
      cy.task('stubGetActivitiesMigrationEstimatedCount', 100_988)

      const page = Page.verifyOnPage(StartActivitiesMigrationPage)
      page.prisonId().type('MDI')

      page.continueButton().click()
      const previewPage = Page.verifyOnPage(StartActivitiesMigrationPreviewPage)
      previewPage.estimateSummary().contains('Estimated number of Activities entities to be migrated: 100,988')
      previewPage
        .dlqWarning()
        .contains(
          'There are 153 messages on the migration dead letter queue. Please clear these before starting the migration',
        )

      previewPage.clearDlqMessages().click()

      const previewPageAgain = Page.verifyOnPage(StartActivitiesMigrationPreviewPage)
      previewPageAgain.startMigrationButton().click()

      Page.verifyOnPage(StartActivitiesMigrationConfirmationPage)
    })
  })
})
