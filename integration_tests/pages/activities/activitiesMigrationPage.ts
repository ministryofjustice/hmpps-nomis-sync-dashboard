import { expect, type Locator, Page } from '@playwright/test'

import MigrationPage from '../migrationPage'

export default class ActivitiesMigrationPage extends MigrationPage {
  readonly migrationResultsDiv: Locator

  readonly warnings: Locator

  private constructor(migrationType: string, page: Page) {
    super(migrationType, page)

    this.migrationResultsDiv = this.page.getByTestId('migration-results-div')
    this.warnings = this.page.getByTestId('warnings-div')
  }

  static async verifyOnPage(migrationType: string, page: Page): Promise<ActivitiesMigrationPage> {
    const migrationPage = new ActivitiesMigrationPage(migrationType, page)
    await expect(migrationPage.header).toBeVisible()
    return migrationPage
  }

  migrationResultsRow = (rowNumber: number): Locator => this.migrationResultsDiv.getByRole('row').nth(rowNumber)

  endNomisActivities = (resultRow: Locator) => resultRow.getByTestId('end-activities-button')

  endActivitiesResult = (resultRow: Locator) => resultRow.getByTestId('end-activities-result')

  moveStartDate = (resultRow: Locator) => resultRow.getByTestId('start-move-start-date-button')
}
