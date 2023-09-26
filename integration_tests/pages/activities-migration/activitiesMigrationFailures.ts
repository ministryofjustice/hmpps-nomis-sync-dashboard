import Page, { PageElement } from '../page'

export default class ActivitiesMigrationFailuresPage extends Page {
  constructor() {
    super('Activities migration failures')
  }

  rows = (): PageElement => cy.get('table tbody tr')

  static goTo(): ActivitiesMigrationFailuresPage {
    cy.visit('/activities-migration/failures')
    return Page.verifyOnPage(ActivitiesMigrationFailuresPage)
  }
}
