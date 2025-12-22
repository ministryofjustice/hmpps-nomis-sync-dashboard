import { expect, type Locator, Page } from '@playwright/test'

import StartMigrationPage from '../startMigrationPage'

export default class VisitsStartMigrationPage extends StartMigrationPage {
  readonly prisonIds: Locator

  readonly socialVisitType: Locator

  readonly fromDateTime: Locator

  readonly toDateTime: Locator

  private constructor(migrationType: string, page: Page) {
    super(migrationType, page)
    this.prisonIds = page.locator('#prisonIds')
    this.socialVisitType = page.getByRole('checkbox', { name: 'Social visits' })
    this.fromDateTime = page.locator('#fromDateTime')
    this.toDateTime = page.locator('#toDateTime')
  }

  static async verifyOnPage(migrationType: string, page: Page): Promise<VisitsStartMigrationPage> {
    const startMigrationPage = new VisitsStartMigrationPage(migrationType, page)
    await expect(startMigrationPage.header).toBeVisible()
    return startMigrationPage
  }
}
