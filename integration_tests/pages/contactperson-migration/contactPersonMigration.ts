import Page, { PageElement } from '../page'

export default class ContactPersonMigrationPage extends Page {
  constructor() {
    super('Contact Person migration')
  }

  startNewMigration = (): PageElement => cy.contains('Start new migration')
}
