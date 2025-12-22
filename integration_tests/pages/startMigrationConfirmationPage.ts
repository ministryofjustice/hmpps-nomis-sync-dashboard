import { expect, type Locator, type Page } from '@playwright/test'

import AbstractPage from './abstractPage'

export default class StartMigrationConfirmationPage extends AbstractPage {
  readonly header: Locator

  readonly confirmationMessage: Locator

  readonly detailsLink: Locator

  private constructor(migrationType: string, page: Page) {
    super(page)
    this.header = page.locator('h1', { hasText: 'migration started' })
    this.detailsLink = page.getByTestId('details-link')
    this.confirmationMessage = page.getByText('to be migrated:')
  }

  static async verifyOnPage(migrationType: string, page: Page): Promise<StartMigrationConfirmationPage> {
    const startMigrationConfirmationPage = new StartMigrationConfirmationPage(migrationType, page)
    await expect(startMigrationConfirmationPage.header).toBeVisible()
    return startMigrationConfirmationPage
  }
}
