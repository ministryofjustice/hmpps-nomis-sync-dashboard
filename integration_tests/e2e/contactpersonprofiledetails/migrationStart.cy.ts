import IndexPage from '../../pages/index'
import Page from '../../pages/page'
import MigrationPage from '../../pages/contactperson-profiledetails-migration/migration'
import StartMigrationPage from '../../pages/contactperson-profiledetails-migration/startMigration'
import StartMigrationPreviewPage from '../../pages/contactperson-profiledetails-migration/startMigrationPreview'
import StartMigrationConfirmationPage from '../../pages/contactperson-profiledetails-migration/startMigrationConfirmation'
import { MigrationHistory } from '../../../server/@types/migration'

context('Contact Person Profile Details Migration Start', () => {
  beforeEach(() => {
    cy.task('reset')
  })
  context('With MIGRATE_CONTACTPERSON role', () => {
    beforeEach(() => {
      cy.task('stubSignIn', { roles: ['ROLE_MIGRATE_CONTACTPERSON'] })
      cy.task('stubListOfMigrationHistory', {
        domain: 'contact-person-profile-details',
        history: contactPersonProfileDetailsMigrationHistory,
      })
      cy.signIn()
      const indexPage = Page.verifyOnPage(IndexPage)
      indexPage.contactPersonProfileDetailsMigrationLink().click()
    })
    it('can navigate to start migration page', () => {
      Page.verifyOnPage(MigrationPage).startNewMigration().click()
      Page.verifyOnPage(StartMigrationPage)
    })

    it('Preview of migration will be shown and changes allowed prior to starting a migration', () => {
      cy.task('stubStartContactPersonProfileDetailsMigration', {
        migrationId: '2022-03-23T11:11:56',
        estimatedCount: 100_988,
      })
      cy.task('stubHealth')
      cy.task('stubGetFailures', 'dps-syscon-dev-migration_personalrelationships_profiledetails_dlq')

      Page.verifyOnPage(MigrationPage).startNewMigration().click()
      cy.task('stubGetPrisonersMigrationEstimatedCount', 100_988)

      const page = Page.verifyOnPage(StartMigrationPage)
      page.prisonerNumber().type('A1234BC')

      page.continueButton().click()
      const previewPage = Page.verifyOnPage(StartMigrationPreviewPage)
      previewPage
        .estimateSummary()
        .contains('Estimated number of Contact Person Profile Details entities to be migrated: 1')
      previewPage
        .dlqWarning()
        .contains(
          'There are 153 messages on the migration dead letter queue. Please clear these before starting the migration',
        )

      previewPage.prisonerNumberRow().contains('A1234BC')
      previewPage.prisonerNumberChangeLink().click()

      // remove the prisoner number
      const amendPage = Page.verifyOnPage(StartMigrationPage)
      amendPage.prisonerNumber().clear()
      amendPage.continueButton().click()

      // check amended prisoner number displayed
      const previewPageAgain = Page.verifyOnPage(StartMigrationPreviewPage)
      previewPageAgain.startMigrationButton().click()

      const confirmationPage = Page.verifyOnPage(StartMigrationConfirmationPage)
      confirmationPage.confirmationMessage().contains('100,988')
      confirmationPage.confirmationMessage().contains('2022-03-23T11:11:56')
      confirmationPage.detailsLink().contains('View migration status')
    })

    it('Can clear DLQ when there are message still present', () => {
      cy.task('stubStartContactPersonProfileDetailsMigration', {
        migrationId: '2022-03-23T11:11:56',
        estimatedCount: 100_988,
      })
      cy.task('stubHealth')
      cy.task('stubGetFailures', 'dps-syscon-dev-migration_personalrelationships_profiledetails_dlq')
      cy.task('stubDeleteContactPersonProfileDetailsFailures')

      Page.verifyOnPage(MigrationPage).startNewMigration().click()
      cy.task('stubGetPrisonersMigrationEstimatedCount', 100_988)

      const page = Page.verifyOnPage(StartMigrationPage)

      page.continueButton().click()
      const previewPage = Page.verifyOnPage(StartMigrationPreviewPage)
      previewPage
        .estimateSummary()
        .contains('Estimated number of Contact Person Profile Details entities to be migrated: 100,988')
      previewPage
        .dlqWarning()
        .contains(
          'There are 153 messages on the migration dead letter queue. Please clear these before starting the migration',
        )

      previewPage.clearDlqMessages().click()

      const previewPageAgain = Page.verifyOnPage(StartMigrationPreviewPage)
      previewPageAgain.startMigrationButton().click()

      Page.verifyOnPage(StartMigrationConfirmationPage)
    })
  })

  const contactPersonProfileDetailsMigrationHistory: MigrationHistory[] = [
    {
      migrationId: '2022-03-14T10:13:56',
      whenStarted: '2022-03-14T10:13:56.878627',
      whenEnded: '2022-03-14T10:14:07.531409',
      estimatedRecordCount: 0,
      filter: '{"prisonerNumber": ""}',
      recordsMigrated: 0,
      recordsFailed: 0,
      migrationType: 'PERSONALRELATIONSHIPS_PROFILEDETAIL',
      status: 'COMPLETED',
      id: '2022-03-14T10:13:56',
      isNew: false,
    },
    {
      migrationId: '2022-03-14T11:45:12',
      whenStarted: '2022-03-14T11:45:12.615759',
      estimatedRecordCount: 205630,
      filter: '{"prisonerNumber": "A1234BC"}',
      recordsMigrated: 1,
      recordsFailed: 162794,
      migrationType: 'PERSONALRELATIONSHIPS_PROFILEDETAIL',
      status: 'STARTED',
      id: '2022-03-14T11:45:12',
      isNew: false,
    },
    {
      migrationId: '2022-03-15T11:00:35',
      whenStarted: '2022-03-15T11:00:35.406626',
      whenEnded: '2022-03-15T11:00:45.990485',
      estimatedRecordCount: 4,
      filter: '{"prisonerNumber": ""}',
      recordsMigrated: 0,
      recordsFailed: 4,
      migrationType: 'PERSONALRELATIONSHIPS_PROFILEDETAIL',
      status: 'COMPLETED',
      id: '2022-03-15T11:00:35',
      isNew: false,
    },
  ]
})
