import Page, { PageElement } from '../page'

export default class AllocationsMigrationFailuresPage extends Page {
  constructor() {
    super('Allocations migration failures')
  }

  rows = (): PageElement => cy.get('table tbody tr')

  static goTo(): AllocationsMigrationFailuresPage {
    cy.visit('/allocations-migration/failures')
    return Page.verifyOnPage(AllocationsMigrationFailuresPage)
  }
}
