import { expect, type Locator, type Page } from '@playwright/test'

import AbstractPage from './abstractPage'

export default class MigrationFailuresPage extends AbstractPage {
  readonly header: Locator

  readonly rows: Locator

  private constructor(migrationType: string, page: Page) {
    super(page)
    this.header = page.locator('h1', { hasText: `${migrationType} migration failures` })
    this.rows = page.getByRole('row')
  }

  static async verifyOnPage(migrationType: string, page: Page): Promise<MigrationFailuresPage> {
    const migrationFailuresPage = new MigrationFailuresPage(migrationType, page)
    await expect(migrationFailuresPage.header).toBeVisible()
    return migrationFailuresPage
  }
}
