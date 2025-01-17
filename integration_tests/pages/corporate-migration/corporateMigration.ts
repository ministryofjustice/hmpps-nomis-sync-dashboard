import Page, { PageElement } from '../page'

export default class CorporateMigrationPage extends Page {
  constructor() {
    super('Corporate migration')
  }

  startNewMigration = (): PageElement => cy.contains('Start new migration')
}
