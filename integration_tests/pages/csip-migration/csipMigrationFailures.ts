import Page, { PageElement } from '../page'

export default class CSIPMigrationFailuresPage extends Page {
  constructor() {
    super('CSIP migration failures')
  }

  rows = (): PageElement => cy.get('table tbody tr')

  static goTo(): CSIPMigrationFailuresPage {
    cy.visit('/csip-migration/failures')
    return Page.verifyOnPage(CSIPMigrationFailuresPage)
  }
}
