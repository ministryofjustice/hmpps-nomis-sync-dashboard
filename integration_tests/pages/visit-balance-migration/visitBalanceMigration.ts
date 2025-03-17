import Page, { PageElement } from '../page'

export default class VisitBalanceMigrationPage extends Page {
  constructor() {
    super('Visit balance migration')
  }

  startNewMigration = (): PageElement => cy.contains('Start new migration')

  migrationResultsDiv = (): PageElement => cy.get('[data-qa=migration-results-div]')

  migrationResultsRow = (rowNumber): PageElement => cy.get('[data-qa=migration-results-div] tbody > tr').eq(rowNumber)

  applyFiltersButton = () => cy.contains('Apply filters')

  prisonId = () => cy.get('#prisonId')

  prisonIdError = () => cy.get('#prisonId-error')

  static goTo(): VisitBalanceMigrationPage {
    cy.visit('/visit-balance-migration')
    return Page.verifyOnPage(VisitBalanceMigrationPage)
  }
}
