import Page, { PageElement } from '../page'

export default class ContactPersonMigrationPage extends Page {
  constructor() {
    super('Prisoner Restriction migration')
  }

  startNewMigration = (): PageElement => cy.contains('Start new migration')
}
