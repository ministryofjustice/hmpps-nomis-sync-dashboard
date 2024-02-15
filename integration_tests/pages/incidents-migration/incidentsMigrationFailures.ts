import Page, { PageElement } from '../page'

export default class IncidentsMigrationFailuresPage extends Page {
  constructor() {
    super('Incidents migration failures')
  }

  rows = (): PageElement => cy.get('table tbody tr')

  static goTo(): IncidentsMigrationFailuresPage {
    cy.visit('/incidents-migration/failures')
    return Page.verifyOnPage(IncidentsMigrationFailuresPage)
  }
}
