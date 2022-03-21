import Page, { PageElement } from '../page'

export default class VisitsMigrationPage extends Page {
  constructor() {
    super('Visits migration')
  }

  startNewMigration = (): PageElement => cy.contains('Start new migration')
}
