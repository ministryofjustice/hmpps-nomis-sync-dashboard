import Page, { PageElement } from '../page'

export default class VisitBalanceMigrationDetailsPage extends Page {
  constructor() {
    super('Visit balance migration details')
  }

  status = (): PageElement => cy.get('.status')

  ended = (): PageElement => cy.get('.ended')

  migrated = (): PageElement => cy.get('.migrated')

  stillToBeProcessed = (): PageElement => cy.get('.still-processed')

  failed = (): PageElement => cy.get('.failed')

  cancel = (): PageElement => cy.get('[data-qa=cancel-migration-button]')

  filterPrisonId = (): PageElement => cy.get('[data-qa=filterPrisonId]')

  static goTo(migrationId: string): VisitBalanceMigrationDetailsPage {
    cy.visit(`/visit-balance-migration/details?migrationId=${migrationId}`)
    return Page.verifyOnPage(VisitBalanceMigrationDetailsPage)
  }
}
