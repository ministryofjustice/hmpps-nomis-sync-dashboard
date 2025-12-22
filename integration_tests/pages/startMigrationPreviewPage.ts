import { expect, type Locator, type Page } from '@playwright/test'

import AbstractPage from './abstractPage'

export default class StartMigrationPreviewPage extends AbstractPage {
  readonly header: Locator

  readonly startMigrationButton: Locator

  readonly estimateSummary: Locator

  readonly dlqWarning: Locator

  readonly clearDlqMessages: Locator

  readonly prisonId: Locator

  readonly prisonerNumber: Locator

  readonly fromDate: Locator

  readonly toDate: Locator

  protected constructor(migrationType: string, page: Page) {
    super(page)
    this.header = page.locator('h1', { hasText: `Start a new ${migrationType} migration - preview` })
    this.startMigrationButton = page.getByTestId('start-migration-button')
    this.estimateSummary = page.getByText('Estimated number of')
    this.dlqWarning = page.getByRole('heading', { name: 'migration dead letter queue' })
    this.clearDlqMessages = page.getByTestId('delete-dlq-button')
    this.prisonId = page.getByTestId('prison-id')
    this.prisonerNumber = page.getByTestId('prisoner-number')
    this.fromDate = page.getByTestId('created-after')
    this.toDate = page.getByTestId('created-before')
  }

  static async verifyOnPage(migrationType: string, page: Page): Promise<StartMigrationPreviewPage> {
    const startMigrationPreviewPage = new StartMigrationPreviewPage(migrationType, page)
    await expect(startMigrationPreviewPage.header).toBeVisible()
    return startMigrationPreviewPage
  }

  getFieldRow = (field: string) => this.page.getByTestId(field).locator('../..')

  getChangeLink = (field: string) => this.page.getByTestId(field)
}
