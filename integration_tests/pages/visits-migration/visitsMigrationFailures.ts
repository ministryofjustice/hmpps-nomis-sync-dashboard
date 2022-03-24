import Page, { PageElement } from '../page'

export default class VisitsMigrationFailuresPage extends Page {
  constructor() {
    super('Visits migration failures')
  }

  rows = (): PageElement => cy.get('table tbody tr')

  static goTo(): VisitsMigrationFailuresPage {
    cy.visit('/visits-migration/failures')
    return Page.verifyOnPage(VisitsMigrationFailuresPage)
  }
}
