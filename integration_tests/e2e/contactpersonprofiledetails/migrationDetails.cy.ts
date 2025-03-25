import MigrationDetailsPage from '../../pages/contactperson-profiledetails-migration/migrationDetails'

context('Contact Person Profile Details Migration Details', () => {
  const migrationId = '2022-03-28T14:28:04'
  beforeEach(() => {
    cy.task('reset')
  })
  context('while migration is in progress', () => {
    beforeEach(() => {
      cy.task('stubSignIn', { roles: ['ROLE_MIGRATE_CONTACTPERSON'] })
      cy.task('stubGetActiveMigration', {
        migrationType: 'PERSONALRELATIONSHIPS_PROFILEDETAIL',
        migrationId,
      })
      cy.task('stubGetMigration', {
        migrationType: 'PERSONALRELATIONSHIPS_PROFILEDETAIL',
        migrationId,
        filter: '{"prisonerNumber":"A1234BC"}',
      })
      cy.signIn()
    })
    it('should show details for migration in progress', () => {
      const page = MigrationDetailsPage.goTo(migrationId)
      page.status().contains('STARTED')
      page.ended().contains('-')
      page.migrated().contains('1000')
      page.failed().contains('100')
      page.stillToBeProcessed().contains('23100')
      page.cancel().contains('Cancel migration')
    })
  })
  context('after migration has completed', () => {
    beforeEach(() => {
      cy.task('stubSignIn', { roles: ['ROLE_MIGRATE_CONTACTPERSON'] })
      cy.task('stubGetActiveMigrationCompleted', {
        migrationType: 'PERSONALRELATIONSHIPS_PROFILEDETAIL',
        migrationId,
      })
      cy.task('stubGetMigrationCompleted', {
        migrationType: 'PERSONALRELATIONSHIPS_PROFILEDETAIL',
        migrationId,
        filter: '{"prisonerNumber":"A1234BC"}',
      })
      cy.signIn()
    })
    it('should show details for migration completed', () => {
      const page = MigrationDetailsPage.goTo(migrationId)
      page.status().contains('COMPLETED')
      page.ended().contains('-')
      page.migrated().contains('2000')
      page.failed().contains('101')
      page.stillToBeProcessed().contains('None')
      page.cancel().should('not.exist')
    })
  })
})
