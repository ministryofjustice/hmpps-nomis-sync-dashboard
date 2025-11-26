import Page, { PageElement } from '../page'

export default class OfficialvisitsMigrationPage extends Page {
  constructor() {
    super('Official Visits migration')
  }

  startNewMigration = (): PageElement => cy.contains('Start new migration')
}
