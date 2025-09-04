import Page, { PageElement } from '../page'

export default class MovementsMigrationPage extends Page {
  constructor() {
    super('Temporary Absence migration')
  }

  startNewMigration = (): PageElement => cy.contains('Start new migration')
}
