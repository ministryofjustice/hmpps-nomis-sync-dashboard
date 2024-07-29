import Page, { PageElement } from '../page'

export default class PrisonPersonMigrationFailuresPage extends Page {
  constructor() {
    super('Prison Person migration failures')
  }

  rows = (): PageElement => cy.get('table tbody tr')

  static goTo(): PrisonPersonMigrationFailuresPage {
    cy.visit('/prisonperson-migration/failures')
    return Page.verifyOnPage(PrisonPersonMigrationFailuresPage)
  }
}
