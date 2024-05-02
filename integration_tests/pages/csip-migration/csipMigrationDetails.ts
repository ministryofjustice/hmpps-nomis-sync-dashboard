import Page, { PageElement } from '../page'

export default class CSIPMigrationDetailsPage extends Page {
  constructor() {
    super('CSIP migration details')
  }

  status = (): PageElement => cy.get('.status')

  ended = (): PageElement => cy.get('.ended')

  migrated = (): PageElement => cy.get('.migrated')

  stillToBeProcessed = (): PageElement => cy.get('.still-processed')

  failed = (): PageElement => cy.get('.failed')

  cancel = (): PageElement => cy.get('[data-qa=cancel-migration-button]')

  static goTo(migrationId: string): CSIPMigrationDetailsPage {
    cy.visit(`/csip-migration/details?migrationId=${migrationId}`)
    return Page.verifyOnPage(CSIPMigrationDetailsPage)
  }
}
