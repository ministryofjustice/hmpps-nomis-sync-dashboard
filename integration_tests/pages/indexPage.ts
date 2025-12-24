import { expect, type Locator, type Page } from '@playwright/test'

import AbstractPage from './abstractPage'

export default class IndexPage extends AbstractPage {
  readonly header: Locator

  private constructor(page: Page) {
    super(page)
    this.header = page.locator('h1', { hasText: 'NOMIS migration and synchronisation dashboard' })
  }

  static async verifyOnPage(page: Page): Promise<IndexPage> {
    const indexPage = new IndexPage(page)
    await expect(indexPage.header).toBeVisible()
    return indexPage
  }

  link = (migration: string): Locator => this.page.getByRole('link', { name: `${migration}`, exact: true })

  migrationLink = (migration: string): Locator => this.link(`${migration} migration`)
}
