import { expect, type Locator, Page } from '@playwright/test'

import StartMigrationPreviewPage from '../startMigrationPreviewPage'

export default class VisitsStartMigrationPreviewPage extends StartMigrationPreviewPage {
  readonly prisonIds: Locator

  readonly fromDateTimeRow: Locator

  readonly fromDateTimeChangeLink: Locator

  readonly roomsWarning: Locator

  private constructor(migrationType: string, page: Page) {
    super(migrationType, page)
    this.prisonIds = page.locator('#prisonIds')
    this.fromDateTimeRow = this.getFieldRow('created-after')
    this.fromDateTimeChangeLink = this.getChangeLink('created-after')
    this.roomsWarning = page.locator('#roomsWarning')
  }

  static async verifyOnPage(migrationType: string, page: Page): Promise<VisitsStartMigrationPreviewPage> {
    const startMigrationPage = new VisitsStartMigrationPreviewPage(migrationType, page)
    await expect(startMigrationPage.header).toBeVisible()
    return startMigrationPage
  }
}
