import Page, { PageElement } from '../page'

export default class PrisonerBalanceMigrationPage extends Page {
  constructor() {
    super('Prisoner balance migration')
  }

  startNewMigration = (): PageElement => cy.contains('Start new migration')

  migrationResultsRow = (rowNumber): PageElement => cy.get('[data-qa=migration-results-div] tbody > tr').eq(rowNumber)

  prisonId = () => cy.get('#prisonId')

  static goTo(): PrisonerBalanceMigrationPage {
    cy.visit('/prisoner-balance-migration')
    return Page.verifyOnPage(PrisonerBalanceMigrationPage)
  }
}
