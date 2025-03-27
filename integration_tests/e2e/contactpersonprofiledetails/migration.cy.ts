import IndexPage from '../../pages/index'
import Page from '../../pages/page'
import MigrationPage from '../../pages/contactperson-profiledetails-migration/migration'
import { MigrationHistory } from '../../../server/@types/migration'
import AuthErrorPage from '../../pages/authError'

context('Contact Person Profile Details Migration Homepage', () => {
  beforeEach(() => {
    cy.task('reset')
  })
  context('With MIGRATE_CONTACTPERSON role', () => {
    beforeEach(() => {
      cy.task('stubSignIn', { roles: ['ROLE_MIGRATE_CONTACTPERSON'] })
      cy.task('stubGetMigrationHistory', {
        migrationType: 'PERSONALRELATIONSHIPS_PROFILEDETAIL',
        history: contactPersonProfileDetailsMigrationHistory,
      })
      cy.signIn()
    })
    it('should see migrate prison person tile', () => {
      const indexPage = Page.verifyOnPage(IndexPage)
      indexPage.contactPersonProfileDetailsMigrationLink().should('be.visible')
    })
    it('should be able to navigate to the prison person migration home page', () => {
      const indexPage = Page.verifyOnPage(IndexPage)
      indexPage.contactPersonProfileDetailsMigrationLink().click()
      Page.verifyOnPage(MigrationPage)
    })

    it('should display list of migrations', () => {
      cy.task('stubGetFailureCountWithMigrationType', { migrationType: 'PERSONALRELATIONSHIPS_PROFILEDETAIL' })

      const migrationPage = MigrationPage.goTo()

      migrationPage.migrationResultsRow(0).within(() => {
        cy.get('[data-qa=migration-id]').should('contain.text', '2022-03-14T10:13:56')
        cy.get('[data-qa=whenStarted]').should('contain.text', '14 March 2022 - 10:13')
        cy.get('[data-qa=whenEnded]').should('contain.text', '14 March 2022 - 10:14')
        cy.get('[data-qa=status]').should('contain.text', 'COMPLETED')
        cy.get('[data-qa=migratedCount]').should('contain.text', '0')
        cy.get('[data-qa=failedCount]').should('contain.text', '0')
        cy.get('[data-qa=estimatedCount]').should('contain.text', '0')
        cy.get('[data-qa=filterPrisonerNumber]').should('not.exist')
        cy.get('[data-qa=progress-link]').should('not.exist')
        cy.get('[data-qa=all-events-link]').should('contain.text', 'View all')
        cy.get('[data-qa=failures-link]').should('not.exist')
      })
      migrationPage.migrationResultsRow(1).within(() => {
        cy.get('[data-qa=migration-id]').should('contain.text', '2022-03-14T11:45:12')
        cy.get('[data-qa=whenStarted]').should('contain.text', '14 March 2022 - 11:45')
        cy.get('[data-qa=whenEnded]').should('not.exist')
        cy.get('[data-qa=status]').should('contain.text', 'STARTED')
        cy.get('[data-qa=migratedCount]').should('contain.text', '1')
        cy.get('[data-qa=failedCount]').should('contain.text', '162794')
        cy.get('[data-qa=estimatedCount]').should('contain.text', '205630')
        cy.get('[data-qa=filterPrisonerNumber]').should('contain.text', 'A1234BC')
        cy.get('[data-qa=progress-link]').should('contain.text', 'View progress')
        cy.get('[data-qa=all-events-link]').should('contain.text', 'View all')
        cy.get('[data-qa=failures-link]').should('contain.text', 'View failures')
      })
      migrationPage.migrationResultsRow(2).within(() => {
        cy.get('[data-qa=migration-id]').should('contain.text', '2022-03-15T11:00:35')
        cy.get('[data-qa=whenStarted]').should('contain.text', '15 March 2022 - 11:00')
        cy.get('[data-qa=whenEnded]').should('contain.text', '15 March 2022 - 11:00')
        cy.get('[data-qa=status]').should('contain.text', 'COMPLETED')
        cy.get('[data-qa=migratedCount]').should('contain.text', '0')
        cy.get('[data-qa=failedCount]').should('contain.text', '4')
        cy.get('[data-qa=estimatedCount]').should('contain.text', '4')
        cy.get('[data-qa=filterPrisonerNumber]').should('not.exist')
        cy.get('[data-qa=progress-link]').should('not.exist')
        cy.get('[data-qa=failures-link]').should('contain.text', 'View failures')
        cy.get('[data-qa=all-events-link]').should('contain.text', 'View all')
        cy.get('[data-qa=failures-link]').should('contain.text', 'View failures')
      })
    })
  })

  context('Without MIGRATE_CONTACTPERSON role', () => {
    beforeEach(() => {
      cy.task('stubSignIn', { roles: ['ROLE_MIGRATE_PRISONERS'] })
      cy.signIn()
    })
    it('should not see migrate prison person tile', () => {
      const indexPage = Page.verifyOnPage(IndexPage)
      indexPage.contactPersonProfileDetailsMigrationLink().should('not.exist')
    })
    it('should not be able to navigate directly to the contact persons migration page', () => {
      cy.visit('/contactperson-profiledetails-migration', { failOnStatusCode: false })
      Page.verifyOnPage(AuthErrorPage)
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
