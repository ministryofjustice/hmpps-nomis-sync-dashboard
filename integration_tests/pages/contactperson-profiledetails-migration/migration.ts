import Page, { PageElement } from '../page'

export default class MigrationPage extends Page {
  constructor() {
    super('Contact Person Profile Details migration')
  }

  startNewMigration = (): PageElement => cy.contains('Start new migration')

  migrationResultsRow = (rowNumber): PageElement => cy.get('[data-qa=migration-results-div] tbody > tr').eq(rowNumber)

  static goTo(): MigrationPage {
    cy.visit('/contactperson-profiledetails-migration')
    return Page.verifyOnPage(MigrationPage)
  }
}
