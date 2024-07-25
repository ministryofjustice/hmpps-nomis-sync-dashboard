import PrisonPersonMigrationDetailsPage from '../pages/prisonperson/prisonPersonMigrationDetails'

context('Prison Person Migration Details', () => {
  const migrationId = '2022-03-28T14:28:04'
  beforeEach(() => {
    cy.task('reset')
  })
  context('while migration is in progress', () => {
    beforeEach(() => {
      cy.task('stubSignIn', { roles: ['ROLE_MIGRATE_PRISONPERSON'] })
      cy.task('stubMigrationInProgress', {
        domain: 'prisonperson',
        type: 'PRISONPERSON',
        migrationId,
        migrated: 1000,
        failed: 100,
        stillToBeProcessed: 23100,
      })
      cy.task('stubGetPrisonPersonMigrationDetailsStarted', migrationId)
      cy.signIn()
    })
    it('should show details for migration in progress', () => {
      const page = PrisonPersonMigrationDetailsPage.goTo(migrationId)
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
      cy.task('stubSignIn', { roles: ['ROLE_MIGRATE_PRISONPERSON'] })
      cy.task('stubMigrationInProgressCompleted', { domain: 'prisonperson', type: 'PRISONPERSON', migrationId })
      cy.task('stubGetPrisonPersonMigrationDetailsCompleted', {
        migrationId,
        whenEnded: '2022-03-28T14:59:24.657071',
        migrated: 2000,
        failed: 101,
      })
      cy.signIn()
    })
    it('should show details for migration completed', () => {
      const page = PrisonPersonMigrationDetailsPage.goTo(migrationId)
      page.status().contains('COMPLETED')
      page.ended().contains('-')
      page.migrated().contains('2000')
      page.failed().contains('101')
      page.stillToBeProcessed().contains('None')
      page.cancel().should('not.exist')
    })
  })
})
