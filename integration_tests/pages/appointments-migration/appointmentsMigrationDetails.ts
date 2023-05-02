import Page, { PageElement } from '../page'

export default class AppointmentsMigrationDetailsPage extends Page {
  constructor() {
    super('Appointments migration details')
  }

  status = (): PageElement => cy.get('.status')

  ended = (): PageElement => cy.get('.ended')

  migrated = (): PageElement => cy.get('.migrated')

  stillToBeProcessed = (): PageElement => cy.get('.still-processed')

  failed = (): PageElement => cy.get('.failed')

  cancel = (): PageElement => cy.get('[data-qa=cancel-migration-button]')

  static goTo(migrationId: string): AppointmentsMigrationDetailsPage {
    cy.visit(`/appointments-migration/details?migrationId=${migrationId}`)
    return Page.verifyOnPage(AppointmentsMigrationDetailsPage)
  }
}
