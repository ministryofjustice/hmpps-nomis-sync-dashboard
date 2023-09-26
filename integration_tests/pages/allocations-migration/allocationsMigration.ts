import Page, { PageElement } from '../page'

export default class AllocationsMigrationPage extends Page {
  constructor() {
    super('Allocations migration')
  }

  startNewMigration = (): PageElement => cy.contains('Start new migration')

  migrationResultsDiv = (): PageElement => cy.get('[data-qa=migration-results-div]')

  migrationResultsRow = (rowNumber): PageElement => cy.get('[data-qa=migration-results-div] tbody > tr').eq(rowNumber)

  static goTo(): AllocationsMigrationPage {
    cy.visit('/allocations-migration')
    return Page.verifyOnPage(AllocationsMigrationPage)
  }
}
