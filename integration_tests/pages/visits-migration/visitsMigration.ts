import Page, { PageElement } from '../page'

export default class VisitsMigrationPage extends Page {
  constructor() {
    super('Visits migration')
  }

  startNewMigration = (): PageElement => cy.contains('Start new migration')

  migrationResultsDiv = (): PageElement => cy.get('[data-qa=migration-results-div]')

  migrationResultsRow = (rowNumber): PageElement => cy.get('[data-qa=migration-results-div] tbody > tr').eq(rowNumber)

  applyFiltersButton = () => cy.contains('Apply filters')

  fromDateTime = () => cy.get('#fromDateTime')

  toDateTime = () => cy.get('#toDateTime')

  fromDateTimeError = () => cy.get('#fromDateTime-error')

  toDateTimeError = () => cy.get('#toDateTime-error')

  static goTo(): VisitsMigrationPage {
    cy.visit('/visits-migration')
    return Page.verifyOnPage(VisitsMigrationPage)
  }
}
