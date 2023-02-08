import Page, { PageElement } from '../page'

export default class SentencingMigrationFailuresPage extends Page {
  constructor() {
    super('Sentencing migration failures')
  }

  rows = (): PageElement => cy.get('table tbody tr')

  static goTo(): SentencingMigrationFailuresPage {
    cy.visit('/sentencing-migration/failures')
    return Page.verifyOnPage(SentencingMigrationFailuresPage)
  }
}
