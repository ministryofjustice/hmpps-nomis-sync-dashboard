import VisitsMigrationDetailsPage from '../pages/visits-migration/visitsMigrationDetails'

context('Visit Migration Details', () => {
  const migrationId = '2022-03-28T14:28:04'
  beforeEach(() => {
    cy.task('reset')
    cy.task('stubAuthUser')
  })
  context('while migration is in progress', () => {
    beforeEach(() => {
      cy.task('stubSignIn', ['ROLE_MIGRATE_VISITS'])
      cy.task('stubInfoInProgress', {
        migrationId,
        migrated: 1000,
        failed: 100,
        stillToBeProcessed: 23100,
      })
      cy.task('stubGetMigrationDetailsStarted', migrationId)
      cy.signIn()
    })
    it('should details for a migration in progress', () => {
      const page = VisitsMigrationDetailsPage.goTo(migrationId)
      page.status().contains('STARTED')
      page.ended().contains('-')
      page.migrated().contains('1000')
      page.failed().contains('100')
      page.stillToBeProcessed().contains('23100')
      page.cancel().contains('Cancel')
    })
  })
  context('after migration has completed', () => {
    beforeEach(() => {
      cy.task('stubSignIn', ['ROLE_MIGRATE_VISITS'])
      cy.task('stubInfoCompleted', migrationId)
      cy.task('stubGetMigrationDetailsCompleted', {
        migrationId,
        whenEnded: '2022-03-28T14:59:24.657071',
        migrated: 2000,
        failed: 101,
      })
      cy.signIn()
    })
    it('should details for a migration in progress', () => {
      const page = VisitsMigrationDetailsPage.goTo(migrationId)
      page.status().contains('COMPLETED')
      page.ended().contains('-')
      page.migrated().contains('2000')
      page.failed().contains('101')
      page.stillToBeProcessed().contains('None')
      page.cancel().should('not.exist')
    })
  })
})
