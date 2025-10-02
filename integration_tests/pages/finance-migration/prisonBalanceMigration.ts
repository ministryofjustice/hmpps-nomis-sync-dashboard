import Page, { PageElement } from '../page'

export default class PrisonBalanceMigrationPage extends Page {
  constructor() {
    super('Prison balance migration')
  }

  startNewMigration = (): PageElement => cy.contains('Start new migration')

  migrationResultsRow = (rowNumber): PageElement => cy.get('[data-qa=migration-results-div] tbody > tr').eq(rowNumber)

  prisonId = () => cy.get('#prisonId')

  static goTo(): PrisonBalanceMigrationPage {
    cy.visit('/prison-balance-migration')
    return Page.verifyOnPage(PrisonBalanceMigrationPage)
  }
}
