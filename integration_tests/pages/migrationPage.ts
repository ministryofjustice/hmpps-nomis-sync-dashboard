import { expect, type Locator, type Page } from '@playwright/test'

import AbstractPage from './abstractPage'

export default class MigrationPage extends AbstractPage {
  readonly header: Locator

  readonly startNewMigration: Locator

  protected constructor(migrationType: string, page: Page) {
    super(page)
    this.header = page.locator('h1', { hasText: `${migrationType} migration` })
    this.startNewMigration = page.getByRole('button', { name: 'Start new migration' })
  }

  static async verifyOnPage(migrationType: string, page: Page): Promise<MigrationPage> {
    const migrationPage = new MigrationPage(migrationType, page)
    await expect(migrationPage.header).toBeVisible()
    return migrationPage
  }

  migrationResultsRow = (rowNumber: number): Locator =>
    this.page.getByTestId('migration-results-div').getByRole('row').nth(rowNumber)
}
