import Page, { PageElement } from '../page'

export default class AppointmentsMigrationPage extends Page {
  constructor() {
    super('Appointments migration')
  }

  startNewMigration = (): PageElement => cy.contains('Start new migration')

  migrationResultsDiv = (): PageElement => cy.get('[data-qa=migration-results-div]')

  migrationResultsRow = (rowNumber): PageElement => cy.get('[data-qa=migration-results-div] tbody > tr').eq(rowNumber)

  static goTo(): AppointmentsMigrationPage {
    cy.visit('/appointments-migration')
    return Page.verifyOnPage(AppointmentsMigrationPage)
  }
}
