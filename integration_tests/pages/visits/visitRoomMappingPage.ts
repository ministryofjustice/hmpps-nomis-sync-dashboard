import { expect, type Locator, Page } from '@playwright/test'

import AbstractPage from '../abstractPage'

export default class VisitRoomMappingPage extends AbstractPage {
  readonly header: Locator

  readonly rows: Locator

  private constructor(prisonId: string, page: Page) {
    super(page)
    this.header = page.locator('h1', { hasText: `Room mappings - ${prisonId}` })
    this.rows = page.getByRole('row')
  }

  static async verifyOnPage(prisonId: string, page: Page): Promise<VisitRoomMappingPage> {
    const visitRoomMappingPage = new VisitRoomMappingPage(prisonId, page)
    await expect(visitRoomMappingPage.header).toBeVisible()
    return visitRoomMappingPage
  }

  static async goto(prisonId: string, page: Page): Promise<VisitRoomMappingPage> {
    await page.goto(`/visits-room-mappings?prisonId=${prisonId}&futureVisits=true`)
    return VisitRoomMappingPage.verifyOnPage(prisonId, page)
  }
}
