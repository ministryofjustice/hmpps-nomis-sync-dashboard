import IndexPage from '../pages/index'
import Page from '../pages/page'
import StartAppointmentsMigrationPage from '../pages/appointments-migration/startAppointmentsMigration'
import StartAppointmentsMigrationConfirmationPage from '../pages/appointments-migration/startAppointmentsMigrationConfirmation'
import StartAppointmentsMigrationPreviewPage from '../pages/appointments-migration/startAppointmentsMigrationPreview'
import AppointmentsMigrationPage from '../pages/appointments-migration/appointmentsMigration'

context('Start Appointments Migration', () => {
  beforeEach(() => {
    cy.task('reset')
    cy.task('stubAuthUser')
  })
  context('With MIGRATE_APPOINTMENTS role', () => {
    beforeEach(() => {
      cy.task('stubSignIn', ['ROLE_MIGRATE_APPOINTMENTS'])
      cy.task('stubListOfAppointmentsMigrationHistory')
      cy.signIn()
      const indexPage = Page.verifyOnPage(IndexPage)
      indexPage.appointmentsMigrationLink().click()
    })
    it('can navigate to start migration page', () => {
      Page.verifyOnPage(AppointmentsMigrationPage).startNewMigration().click()
      Page.verifyOnPage(StartAppointmentsMigrationPage)
    })

    it('will validate page when selecting start migration', () => {
      cy.get('span[data-qa="filterPrisonIds"]').contains('MDI,SWI')
      Page.verifyOnPage(AppointmentsMigrationPage).startNewMigration().click()
      const page = Page.verifyOnPage(StartAppointmentsMigrationPage)
      page.prisonIds().clear()
      page.fromDate().type('invalid')
      page.toDate().type('invalid')

      page.continueButton().click()

      const pageWithErrors = Page.verifyOnPage(StartAppointmentsMigrationPage)
      pageWithErrors.errorSummary().contains('Enter one or more prison IDs')
      pageWithErrors.errorSummary().contains('Enter a real date, like 2020-03-23')
    })

    it('Preview of migration will be shown and changes allowed prior to starting a migration', () => {
      cy.task('stubStartAppointmentsMigration', {
        migrationId: '2022-03-23T11:11:56',
        estimatedCount: 100_988,
      })
      cy.task('stubHealth')
      cy.task('stubGetAppointmentsFailures')

      Page.verifyOnPage(AppointmentsMigrationPage).startNewMigration().click()
      cy.task('stubGetAppointmentsMigrationEstimatedCount', 100_988)

      const page = Page.verifyOnPage(StartAppointmentsMigrationPage)
      page.prisonIds().type('HEI')
      page.fromDate().type('2020-03-23')
      page.toDate().type('2020-03-30')

      page.continueButton().click()
      const previewPage = Page.verifyOnPage(StartAppointmentsMigrationPreviewPage)
      previewPage.estimateSummary().contains('Estimated number of Appointments entities to be migrated: 100,988')
      previewPage
        .dlqWarning()
        .contains(
          'There are 153 messages on the migration dead letter queue. Please clear these before starting the migration',
        )

      previewPage.fromDateRow().contains('2020-03-23')
      previewPage.fromDateChangeLink().click()

      // amend the from date
      const amendPage = Page.verifyOnPage(StartAppointmentsMigrationPage)
      amendPage.fromDate().clear()
      amendPage.fromDate().type('2020-03-20')
      page.continueButton().click()

      // check amended date displayed
      const previewPageAgain = Page.verifyOnPage(StartAppointmentsMigrationPreviewPage)
      previewPageAgain.fromDateRow().contains('2020-03-20')
      previewPageAgain.startMigrationButton().click()

      const confirmationPage = Page.verifyOnPage(StartAppointmentsMigrationConfirmationPage)
      confirmationPage.confirmationMessage().contains('100,988')
      confirmationPage.confirmationMessage().contains('2022-03-23T11:11:56')
      confirmationPage.detailsLink().contains('View migration status')
    })

    it('Can clear DLQ when there are message still present', () => {
      cy.task('stubStartAppointmentsMigration', {
        migrationId: '2022-03-23T11:11:56',
        estimatedCount: 100_988,
      })
      cy.task('stubHealth')
      cy.task('stubGetAppointmentsFailures')
      cy.task('stubDeleteAppointmentsFailures')

      Page.verifyOnPage(AppointmentsMigrationPage).startNewMigration().click()
      cy.task('stubGetAppointmentsMigrationEstimatedCount', 100_988)

      const page = Page.verifyOnPage(StartAppointmentsMigrationPage)
      page.prisonIds().type('HEI')
      page.fromDate().type('2020-03-23')
      page.toDate().type('2020-03-30')

      page.continueButton().click()
      const previewPage = Page.verifyOnPage(StartAppointmentsMigrationPreviewPage)
      previewPage.estimateSummary().contains('Estimated number of Appointments entities to be migrated: 100,988')
      previewPage
        .dlqWarning()
        .contains(
          'There are 153 messages on the migration dead letter queue. Please clear these before starting the migration',
        )

      previewPage.clearDlqMessages().click()

      const previewPageAgain = Page.verifyOnPage(StartAppointmentsMigrationPreviewPage)
      previewPageAgain.startMigrationButton().click()

      Page.verifyOnPage(StartAppointmentsMigrationConfirmationPage)
    })
  })
})
