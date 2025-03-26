import AllocationsMigrationDetailsPage from '../../pages/allocations-migration/allocationsMigrationDetails'

context('Allocations Migration Details', () => {
  const migrationId = '2022-03-28T14:28:04'
  beforeEach(() => {
    cy.task('reset')
  })
  context('while migration is in progress', () => {
    beforeEach(() => {
      cy.task('stubSignIn', { roles: ['ROLE_MIGRATE_ACTIVITIES'] })
      cy.task('stubGetActiveMigration', {
        migrationType: 'ALLOCATIONS',
        migrationId,
      })
      cy.task('stubGetMigration', {
        migrationType: 'ALLOCATIONS',
        migrationId,
        filter: '{"prisonId":"MDI"}',
      })
      cy.signIn()
    })
    it('should details for a migration in progress', () => {
      const page = AllocationsMigrationDetailsPage.goTo(migrationId)
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
      cy.task('stubSignIn', { roles: ['ROLE_MIGRATE_ACTIVITIES'] })
      cy.task('stubGetActiveMigrationCompleted', {
        migrationType: 'ALLOCATIONS',
        migrationId,
      })
      cy.task('stubGetMigrationCompleted', {
        migrationType: 'ALLOCATIONS',
        migrationId,
        filter: '{"prisonId":"MDI"}',
      })
      cy.signIn()
    })
    it('should details for a migration in progress', () => {
      const page = AllocationsMigrationDetailsPage.goTo(migrationId)
      page.status().contains('COMPLETED')
      page.ended().contains('-')
      page.migrated().contains('2000')
      page.failed().contains('101')
      page.stillToBeProcessed().contains('None')
      page.cancel().should('not.exist')
    })
  })
})
