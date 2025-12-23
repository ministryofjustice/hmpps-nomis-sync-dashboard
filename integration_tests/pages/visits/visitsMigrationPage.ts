import { expect, type Locator, Page } from '@playwright/test'

import MigrationPage from '../migrationPage'

export default class VisitsMigrationPage extends MigrationPage {
  readonly fromDateTime: Locator

  readonly fromDateTimeError: Locator

  readonly toDateTime: Locator

  readonly toDateTimeError: Locator

  readonly applyFiltersButton: Locator

  private constructor(migrationType: string, page: Page) {
    super(migrationType, page)
    this.fromDateTime = page.locator('#fromDateTime')
    this.fromDateTimeError = page.locator('#fromDateTime-error')
    this.toDateTime = page.locator('#toDateTime')
    this.toDateTimeError = page.locator('#toDateTime-error')
    this.applyFiltersButton = page.getByRole('button', { name: 'Apply filters' })
  }

  static async verifyOnPage(migrationType: string, page: Page): Promise<VisitsMigrationPage> {
    const migrationPage = new VisitsMigrationPage(migrationType, page)
    await expect(migrationPage.header).toBeVisible()
    return migrationPage
  }
}
