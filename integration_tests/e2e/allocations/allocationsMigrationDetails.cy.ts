import AllocationsMigrationDetailsPage from '../../pages/allocations-migration/allocationsMigrationDetails'

context('Allocations Migration Details', () => {
  const migrationId = '2022-03-28T14:28:04'
  beforeEach(() => {
    cy.task('reset')
  })
  context('while migration is in progress', () => {
    beforeEach(() => {
      cy.task('stubSignIn', { roles: ['ROLE_MIGRATE_ACTIVITIES'] })
      cy.task('stubMigrationInProgress', {
        domain: 'allocations',
        type: 'AllocationS',
        migrationId,
        migrated: 1000,
        failed: 100,
        stillToBeProcessed: 23100,
      })
      cy.task('stubGetAllocationsMigrationDetailsStarted', migrationId)
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
      cy.task('stubMigrationInProgressCompleted', { domain: 'allocations', type: 'ALLOCATIONS', migrationId })
      cy.task('stubGetAllocationsMigrationDetailsCompleted', {
        migrationId,
        whenEnded: '2022-03-28T14:59:24.657071',
        migrated: 2000,
        failed: 101,
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
