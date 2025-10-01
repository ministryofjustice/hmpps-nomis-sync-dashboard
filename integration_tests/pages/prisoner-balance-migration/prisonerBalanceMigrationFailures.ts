import Page, { PageElement } from '../page'

export default class PrisonerBalanceMigrationFailuresPage extends Page {
  constructor() {
    super('Prisoner balance migration failures')
  }

  rows = (): PageElement => cy.get('table tbody tr')

  static goTo(): PrisonerBalanceMigrationFailuresPage {
    cy.visit('/prisoner-balance-migration/failures')
    return Page.verifyOnPage(PrisonerBalanceMigrationFailuresPage)
  }
}
