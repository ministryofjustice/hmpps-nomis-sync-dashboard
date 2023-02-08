import Page, { PageElement } from '../page'

export default class SentencingMigrationDetailsPage extends Page {
  constructor() {
    super('Sentencing migration details')
  }

  status = (): PageElement => cy.get('.status')

  ended = (): PageElement => cy.get('.ended')

  migrated = (): PageElement => cy.get('.migrated')

  stillToBeProcessed = (): PageElement => cy.get('.still-processed')

  failed = (): PageElement => cy.get('.failed')

  cancel = (): PageElement => cy.get('[data-qa=cancel-migration-button]')

  static goTo(migrationId: string): SentencingMigrationDetailsPage {
    cy.visit(`/sentencing-migration/details?migrationId=${migrationId}`)
    return Page.verifyOnPage(SentencingMigrationDetailsPage)
  }
}
