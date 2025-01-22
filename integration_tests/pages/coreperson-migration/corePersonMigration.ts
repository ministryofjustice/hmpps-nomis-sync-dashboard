import Page, { PageElement } from '../page'

export default class CorePersonMigrationPage extends Page {
  constructor() {
    super('Core Person migration')
  }

  startNewMigration = (): PageElement => cy.contains('Start new migration')
}
