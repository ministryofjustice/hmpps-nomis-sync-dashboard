import Page, { PageElement } from '../page'

export default class AppointmentsMigrationPage extends Page {
  constructor() {
    super('Appointments migration')
  }

  startNewMigration = (): PageElement => cy.contains('Start new migration')

  migrationResultsDiv = (): PageElement => cy.get('[data-qa=migration-results-div]')

  migrationResultsRow = (rowNumber): PageElement => cy.get('[data-qa=migration-results-div] tbody > tr').eq(rowNumber)

  applyFiltersButton = () => cy.contains('Apply filters')

  prisons = () => cy.get('#prisonId')

  fromDateTime = () => cy.get('#fromDateTime')

  toDateTime = () => cy.get('#toDateTime')

  fromDateTimeError = () => cy.get('#fromDateTime-error')

  toDateTimeError = () => cy.get('#toDateTime-error')

  static goTo(): AppointmentsMigrationPage {
    cy.visit('/appointments-migration')
    return Page.verifyOnPage(AppointmentsMigrationPage)
  }
}
