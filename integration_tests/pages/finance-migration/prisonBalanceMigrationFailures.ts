import Page, { PageElement } from '../page'

export default class PrisonBalanceMigrationFailuresPage extends Page {
  constructor() {
    super('Prison balance migration failures')
  }

  rows = (): PageElement => cy.get('table tbody tr')

  static goTo(): PrisonBalanceMigrationFailuresPage {
    cy.visit('/prison-balance-migration/failures')
    return Page.verifyOnPage(PrisonBalanceMigrationFailuresPage)
  }
}
