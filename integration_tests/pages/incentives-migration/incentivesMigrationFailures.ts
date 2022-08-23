import Page, { PageElement } from '../page'

export default class IncentivesMigrationFailuresPage extends Page {
  constructor() {
    super('Incentives migration failures')
  }

  rows = (): PageElement => cy.get('table tbody tr')

  static goTo(): IncentivesMigrationFailuresPage {
    cy.visit('/incentives-migration/failures')
    return Page.verifyOnPage(IncentivesMigrationFailuresPage)
  }
}
