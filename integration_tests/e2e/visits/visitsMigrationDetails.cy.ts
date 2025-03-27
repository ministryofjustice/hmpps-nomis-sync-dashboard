import VisitsMigrationDetailsPage from '../../pages/visits-migration/visitsMigrationDetails'

context('Visit Migration Details', () => {
  const migrationId = '2022-03-28T14:28:04'
  beforeEach(() => {
    cy.task('reset')
  })
  context('while migration is in progress', () => {
    beforeEach(() => {
      cy.task('stubSignIn', { roles: ['ROLE_MIGRATE_VISITS'] })
      cy.task('stubGetActiveMigration', {
        migrationType: 'VISITS',
        migrationId,
      })
      cy.task('stubGetMigration', {
        migrationId,
        migrationType: 'VISITS',
        filter:
          '{"prisonIds":["HEI"],"visitTypes":["SCON"],"fromDateTime":"2016-03-23T00:00:00","ignoreMissingRoom":false}',
      })
      cy.signIn()
    })
    it('should details for a migration in progress', () => {
      const page = VisitsMigrationDetailsPage.goTo(migrationId)
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
      cy.task('stubSignIn', { roles: ['ROLE_MIGRATE_VISITS'] })
      cy.task('stubGetActiveMigrationCompleted', { migrationType: 'VISITS', migrationId })
      cy.task('stubGetMigrationCompleted', {
        migrationId,
        migrationType: 'VISITS',
        filter:
          '{"prisonIds":["HEI"],"visitTypes":["SCON"],"fromDateTime":"2016-03-23T00:00:00","ignoreMissingRoom":false}',
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
