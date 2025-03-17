import Page, { PageElement } from '../page'

export default class VisitBalanceMigrationFailuresPage extends Page {
  constructor() {
    super('Visit balance migration failures')
  }

  rows = (): PageElement => cy.get('table tbody tr')

  static goTo(): VisitBalanceMigrationFailuresPage {
    cy.visit('/visit-balance-migration/failures')
    return Page.verifyOnPage(VisitBalanceMigrationFailuresPage)
  }
}
