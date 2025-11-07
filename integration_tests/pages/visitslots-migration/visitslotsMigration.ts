import Page, { PageElement } from '../page'

export default class VisitslotsMigrationPage extends Page {
  constructor() {
    super('Visit Time Slots migration')
  }

  startNewMigration = (): PageElement => cy.contains('Start new migration')
}
