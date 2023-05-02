import Page, { PageElement } from '../page'

export default class AppointmentsMigrationFailuresPage extends Page {
  constructor() {
    super('Appointments migration failures')
  }

  rows = (): PageElement => cy.get('table tbody tr')

  static goTo(): AppointmentsMigrationFailuresPage {
    cy.visit('/appointments-migration/failures')
    return Page.verifyOnPage(AppointmentsMigrationFailuresPage)
  }
}
