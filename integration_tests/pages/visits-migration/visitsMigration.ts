import Page, { PageElement } from '../page'

export default class VisitsMigrationPage extends Page {
  constructor() {
    super('Visits migration')
  }

  startNewMigration = (): PageElement => cy.contains('Start new migration')

  migrationResultsDiv = (): PageElement => cy.get('[data-qa=migration-results-div]')

  migrationResultsRow = (rowNumber): PageElement => cy.get('[data-qa=migration-results-div] tbody > tr').eq(rowNumber)

  static goTo(): VisitsMigrationPage {
    cy.visit('/visits-migration')
    return Page.verifyOnPage(VisitsMigrationPage)
  }
}
