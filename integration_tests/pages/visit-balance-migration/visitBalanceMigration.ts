import Page, { PageElement } from '../page'

export default class VisitBalanceMigrationPage extends Page {
  constructor() {
    super('Visit balance migration')
  }

  startNewMigration = (): PageElement => cy.contains('Start new migration')
}
