import Page, { PageElement } from '../page'

export default class ActivitiesMigrationPage extends Page {
  constructor() {
    super('Activities migration')
  }

  startNewMigration = (): PageElement => cy.contains('Start new migration')

  migrationResultsDiv = (): PageElement => cy.get('[data-qa=migration-results-div]')

  migrationResultsRow = (rowNumber): PageElement => cy.get('[data-qa=migration-results-div] tbody > tr').eq(rowNumber)

  endNomisActivities = (resultRow: PageElement) => resultRow.find('[data-qa=end-activities-button]')

  endActivitiesResult = (resultRow: PageElement) => resultRow.find('[data-qa=end-activities-result]')

  static goTo(): ActivitiesMigrationPage {
    cy.visit('/activities-migration')
    return Page.verifyOnPage(ActivitiesMigrationPage)
  }
}
