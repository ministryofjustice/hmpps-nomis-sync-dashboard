import Page, { PageElement } from '../page'

export default class ActivitiesMigrationPage extends Page {
  constructor() {
    super('Activities migration')
  }

  startNewMigration = (): PageElement => cy.get('[data-qa=start-new-migration]')

  migrationResultsDiv = (): PageElement => cy.get('[data-qa=migration-results-div]')

  migrationResultsRow = (rowNumber): PageElement => cy.get('[data-qa=migration-results-div] tbody > tr').eq(rowNumber)

  endNomisActivities = (resultRow: PageElement) => resultRow.find('[data-qa=end-activities-button]')

  endActivitiesResult = (resultRow: PageElement) => resultRow.find('[data-qa=end-activities-result]')

  moveStartDate = (resultRow: PageElement) => resultRow.find('[data-qa=start-move-start-date-button]')

  warnings = (): PageElement => cy.get('[data-qa=warnings-div]')

  static goTo(): ActivitiesMigrationPage {
    cy.visit('/activities-migration')
    return Page.verifyOnPage(ActivitiesMigrationPage)
  }
}
