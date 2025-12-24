import { expect, type Locator, Page } from '@playwright/test'

import AbstractPage from '../abstractPage'

export default class MoveActivityStartDate extends AbstractPage {
  readonly header: Locator

  readonly newActivityStartDateInput: Locator

  readonly moveStartDateButton: Locator

  private constructor(page: Page) {
    super(page)
    this.header = page.locator('h1', { hasText: `Move activity start date` })
    this.newActivityStartDateInput = page.locator('#newActivityStartDate')
    this.moveStartDateButton = page.getByTestId('move-start-date-button')
  }

  static async verifyOnPage(page: Page): Promise<MoveActivityStartDate> {
    const moveActivityStartDate = new MoveActivityStartDate(page)
    await expect(moveActivityStartDate.header).toBeVisible()
    return moveActivityStartDate
  }
}
