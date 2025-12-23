import { expect, type Locator, type Page } from '@playwright/test'

import AbstractPage from './abstractPage'

export default class MigrationDetailsPage extends AbstractPage {
  readonly header: Locator

  readonly status: Locator

  readonly ended: Locator

  readonly migrated: Locator

  readonly failed: Locator

  readonly stillToBeProcessed: Locator

  readonly filterPrisonId: Locator

  readonly filterFromDate: Locator

  readonly cancel: Locator

  private constructor(migrationType: string, page: Page) {
    super(page)
    this.header = page.locator('h1', { hasText: `${migrationType} migration details` })
    this.status = page.locator('.status')
    this.ended = page.locator('.ended')
    this.migrated = page.locator('.migrated')
    this.failed = page.locator('.failed')
    this.stillToBeProcessed = page.locator('.still-processed')
    this.cancel = page.getByTestId('cancel-migration-button')
    this.filterPrisonId = page.getByTestId('filterPrisonId')
    this.filterFromDate = page.getByTestId('filterFromDate')
  }

  static async verifyOnPage(migrationType: string, page: Page): Promise<MigrationDetailsPage> {
    const migrationDetailsPage = new MigrationDetailsPage(migrationType, page)
    await expect(migrationDetailsPage.header).toBeVisible()
    return migrationDetailsPage
  }
}
