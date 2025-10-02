import PrisonerBalanceMigrationDetailsPage from '../../pages/finance-migration/prisonerBalanceMigrationDetails'

context('Prisoner Balance Migration Details', () => {
  const migrationId = '2022-03-28T14:28:04'
  beforeEach(() => {
    cy.task('reset')
  })
  context('while migration is in progress', () => {
    beforeEach(() => {
      cy.task('stubSignIn', { roles: ['ROLE_MIGRATE_NOMIS_SYSCON'] })
      cy.task('stubGetActiveMigration', {
        migrationType: 'PRISONER_BALANCE',
        migrationId,
      })
      cy.task('stubGetMigration', { migrationId, migrationType: 'PRISONER_BALANCE', filter: '{"prisonId":"MDI"}' })
      cy.signIn()
    })
    it('should show details for a migration in progress', () => {
      const page = PrisonerBalanceMigrationDetailsPage.goTo(migrationId)
      page.status().contains('STARTED')
      page.ended().contains('-')
      page.migrated().contains('1000')
      page.failed().contains('100')
      page.stillToBeProcessed().contains('23100')
      page.filterPrisonId().should('contain.text', 'MDI')
      page.cancel().contains('Cancel migration')
    })
  })
  context('after migration has completed', () => {
    beforeEach(() => {
      cy.task('stubSignIn', { roles: ['ROLE_MIGRATE_NOMIS_SYSCON'] })
      cy.task('stubGetActiveMigrationCompleted', { migrationType: 'PRISONER_BALANCE', migrationId })
      cy.task('stubGetMigrationCompleted', {
        migrationId,
        migrationType: 'PRISONER_BALANCE',
        filter: '{"prisonId":"MDI"}',
      })
      cy.signIn()
    })
    it('should details for a migration in progress', () => {
      const page = PrisonerBalanceMigrationDetailsPage.goTo(migrationId)
      page.status().contains('COMPLETED')
      page.ended().contains('-')
      page.migrated().contains('2000')
      page.failed().contains('101')
      page.stillToBeProcessed().contains('None')
      page.cancel().should('not.exist')
    })
  })
})
