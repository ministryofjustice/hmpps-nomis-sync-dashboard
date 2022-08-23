import Page, { PageElement } from '../page'

export default class IncentivesMigrationPage extends Page {
  constructor() {
    super('Incentives migration')
  }

  startNewMigration = (): PageElement => cy.contains('Start new migration')

  migrationResultsDiv = (): PageElement => cy.get('[data-qa=migration-results-div]')

  migrationResultsRow = (rowNumber): PageElement => cy.get('[data-qa=migration-results-div] tbody > tr').eq(rowNumber)

  applyFiltersButton = () => cy.contains('Apply filters')

  fromDateTime = () => cy.get('#fromDateTime')

  toDateTime = () => cy.get('#toDateTime')

  fromDateTimeError = () => cy.get('#fromDateTime-error')

  toDateTimeError = () => cy.get('#toDateTime-error')

  static goTo(): IncentivesMigrationPage {
    cy.visit('/incentives-migration')
    return Page.verifyOnPage(IncentivesMigrationPage)
  }
}
