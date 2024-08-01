import Page, { PageElement } from '../page'

export default class PrisonPersonMigrationPage extends Page {
  constructor() {
    super('Prison Person migration')
  }

  startNewMigration = (): PageElement => cy.contains('Start new migration')

  migrationResultsDiv = (): PageElement => cy.get('[data-qa=migration-results-div]')

  migrationResultsRow = (rowNumber): PageElement => cy.get('[data-qa=migration-results-div] tbody > tr').eq(rowNumber)

  static goTo(): PrisonPersonMigrationPage {
    cy.visit('/prisonperson-migration')
    return Page.verifyOnPage(PrisonPersonMigrationPage)
  }
}
