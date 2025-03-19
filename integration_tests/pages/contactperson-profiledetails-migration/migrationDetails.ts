import Page, { PageElement } from '../page'

export default class MigrationDetailsPage extends Page {
  constructor() {
    super('Contact Person Profile Details migration details')
  }

  status = (): PageElement => cy.get('.status')

  ended = (): PageElement => cy.get('.ended')

  migrated = (): PageElement => cy.get('.migrated')

  stillToBeProcessed = (): PageElement => cy.get('.still-processed')

  failed = (): PageElement => cy.get('.failed')

  cancel = (): PageElement => cy.get('[data-qa=cancel-migration-button]')

  static goTo(migrationId: string): MigrationDetailsPage {
    cy.visit(`/contactperson-profiledetails-migration/details?migrationId=${migrationId}`)
    return Page.verifyOnPage(MigrationDetailsPage)
  }
}
