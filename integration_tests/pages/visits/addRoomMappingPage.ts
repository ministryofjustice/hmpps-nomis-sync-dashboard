import { expect, type Locator, Page } from '@playwright/test'

import AbstractPage from '../abstractPage'

export default class AddRoomMappingPage extends AbstractPage {
  readonly header: Locator

  readonly vsipIdEntry: Locator

  readonly addMapping: Locator

  private constructor(prisonId: string, page: Page) {
    super(page)
    this.header = page.locator('h1', { hasText: `Add room mapping for NOMIS room - ${prisonId}` })
    this.vsipIdEntry = page.getByRole('textbox', { name: 'Enter the DPS room description' })
    this.addMapping = page.getByRole('button', { name: 'add mapping' })
  }

  static async verifyOnPage(prisonId: string, page: Page): Promise<AddRoomMappingPage> {
    const addRoomMappingPage = new AddRoomMappingPage(prisonId, page)
    await expect(addRoomMappingPage.header).toBeVisible()
    return addRoomMappingPage
  }
}
