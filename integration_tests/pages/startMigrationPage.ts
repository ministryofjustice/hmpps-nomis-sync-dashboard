import { expect, type Locator, type Page } from '@playwright/test'

import AbstractPage from './abstractPage'

export default class StartMigrationPage extends AbstractPage {
  readonly header: Locator

  readonly continueButton: Locator

  readonly prisonId: Locator

  readonly prisonerNumber: Locator

  readonly fromDate: Locator

  readonly toDate: Locator

  protected constructor(migrationType: string, page: Page) {
    super(page)
    this.header = page.locator('h1', { hasText: `Start a new ${migrationType} migration` })
    this.continueButton = page.getByTestId('continue-button')
    this.prisonId = page.locator('#prisonId')
    this.prisonerNumber = page.locator('#prisonerNumber')
    this.fromDate = page.locator('#fromDate')
    this.toDate = page.locator('#toDate')
  }

  static async verifyOnPage(migrationType: string, page: Page): Promise<StartMigrationPage> {
    const startMigrationPage = new StartMigrationPage(migrationType, page)
    await expect(startMigrationPage.header).toBeVisible()
    return startMigrationPage
  }

  getField = (field: string) => this.page.locator(`#${field}`)
}
