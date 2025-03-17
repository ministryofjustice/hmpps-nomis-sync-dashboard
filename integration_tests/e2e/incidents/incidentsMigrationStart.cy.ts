import IndexPage from '../../pages'
import Page from '../../pages/page'
import StartIncidentsMigrationPage from '../../pages/incidents-migration/startIncidentsMigration'
import StartIncidentsMigrationConfirmationPage from '../../pages/incidents-migration/startIncidentsMigrationConfirmation'
import StartIncidentsMigrationPreviewPage from '../../pages/incidents-migration/startIncidentsMigrationPreview'

import IncidentsMigrationPage from '../../pages/incidents-migration/incidentsMigration'

context('Incidents Migration Start', () => {
  beforeEach(() => {
    cy.task('reset')
  })
  context('With MIGRATE_INCIDENT_REPORTS role', () => {
    beforeEach(() => {
      cy.task('stubSignIn', { roles: ['ROLE_MIGRATE_INCIDENT_REPORTS'] })
      cy.task('stubListOfIncidentsMigrationHistory')
      cy.signIn()
      const indexPage = Page.verifyOnPage(IndexPage)
      indexPage.incidentsMigrationLink().click()
    })
    it('can navigate to start migration page', () => {
      Page.verifyOnPage(IncidentsMigrationPage).startNewMigration().click()
      Page.verifyOnPage(StartIncidentsMigrationPage)
    })

    it('will validate page when selecting start migration', () => {
      Page.verifyOnPage(IncidentsMigrationPage).startNewMigration().click()
      const page = Page.verifyOnPage(StartIncidentsMigrationPage)
      page.fromDate().type('invalid')
      page.toDate().type('invalid')

      page.continueButton().click()

      const pageWithErrors = Page.verifyOnPage(StartIncidentsMigrationPage)
      pageWithErrors.errorSummary().contains('Enter a real date, like 2020-03-23')
    })
    it('Preview of migration will be shown and changes allowed prior to starting a migration', () => {
      cy.task('stubStartIncidentsMigration', {
        migrationId: '2022-03-23T11:11:56',
        estimatedCount: 100_988,
      })
      cy.task('stubHealth')
      cy.task('stubGetIncidentsFailures')

      Page.verifyOnPage(IncidentsMigrationPage).startNewMigration().click()
      cy.task('stubGetIncidentsMigrationEstimatedCount', 100_988)

      const page = Page.verifyOnPage(StartIncidentsMigrationPage)
      page.fromDate().type('2020-03-23')
      page.toDate().type('2020-03-30')

      page.continueButton().click()
      const previewPage = Page.verifyOnPage(StartIncidentsMigrationPreviewPage)
      previewPage.estimateSummary().contains('Estimated number of Incidents entities to be migrated: 100,988')
      previewPage
        .dlqWarning()
        .contains(
          'There are 153 messages on the migration dead letter queue. Please clear these before starting the migration',
        )

      previewPage.fromDateRow().contains('2020-03-23')
      previewPage.fromDateChangeLink().click()

      // amend the from date
      const amendPage = Page.verifyOnPage(StartIncidentsMigrationPage)
      amendPage.fromDate().clear()
      amendPage.fromDate().type('2020-03-20')
      amendPage.continueButton().click()

      // check amended date displayed
      const previewPageAgain = Page.verifyOnPage(StartIncidentsMigrationPreviewPage)
      previewPageAgain.fromDateRow().contains('2020-03-20')
      previewPageAgain.startMigrationButton().click()

      const confirmationPage = Page.verifyOnPage(StartIncidentsMigrationConfirmationPage)
      confirmationPage.confirmationMessage().contains('100,988')
      confirmationPage.confirmationMessage().contains('2022-03-23T11:11:56')
      confirmationPage.detailsLink().contains('View migration status')
    })

    it('Can clear DLQ when there are message still present', () => {
      cy.task('stubStartIncidentsMigration', {
        migrationId: '2022-03-23T11:11:56',
        estimatedCount: 100_988,
      })
      cy.task('stubHealth')
      cy.task('stubGetIncidentsFailures')
      cy.task('stubDeleteIncidentsFailures')

      Page.verifyOnPage(IncidentsMigrationPage).startNewMigration().click()
      cy.task('stubGetIncidentsMigrationEstimatedCount', 100_988)

      const page = Page.verifyOnPage(StartIncidentsMigrationPage)
      page.fromDate().type('2020-03-23')
      page.toDate().type('2020-03-30')

      page.continueButton().click()
      const previewPage = Page.verifyOnPage(StartIncidentsMigrationPreviewPage)
      previewPage.estimateSummary().contains('Estimated number of Incidents entities to be migrated: 100,988')
      previewPage
        .dlqWarning()
        .contains(
          'There are 153 messages on the migration dead letter queue. Please clear these before starting the migration',
        )

      previewPage.clearDlqMessages().click()

      const previewPageAgain = Page.verifyOnPage(StartIncidentsMigrationPreviewPage)
      previewPageAgain.startMigrationButton().click()

      Page.verifyOnPage(StartIncidentsMigrationConfirmationPage)
    })
  })
})
