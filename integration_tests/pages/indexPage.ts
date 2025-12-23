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
//
// headerUserName = (): PageElement => cy.get('[data-qa=header-user-name]')
//
// headerPhaseBanner = (): PageElement => cy.get('[data-qa=header-phase-banner]')
//
// visitsMigrationLink = (): PageElement => cy.get('[href="/visits-migration"]')
//
// visitRoomMappingsLink = (): PageElement => cy.get('[href="/visits-room-mappings/prison"]')
//
// sentencingMigrationLink = (): PageElement => cy.get('[href="/sentencing-migration"]')
//
// appointmentsMigrationLink = (): PageElement => cy.get('[href="/appointments-migration"]')
//
// activitiesMigrationLink = (): PageElement => cy.get('[href="/activities-migration"]')
//
// allocationsMigrationLink = (): PageElement => cy.get('[href="/allocations-migration"]')
//
// incidentsMigrationLink = (): PageElement => cy.get('[href="/incidents-migration"]')
//
// contactPersonMigrationLink = (): PageElement => cy.get('[href="/contactperson-migration"]')
//
// contactPersonProfileDetailsMigrationLink = (): PageElement =>
//   cy.get('[href="/contactperson-profiledetails-migration"]')
//
// visitslotsMigrationLink = (): PageElement => cy.get('[href="/visitslots-migration"]')
//
// visitBalanceMigrationLink = (): PageElement => cy.get('[href="/visit-balance-migration"]')
//
// movementsBalanceMigrationLink = (): PageElement => cy.get('[href="/movements-migration"]')
//
// migrationLink = (migration: string): PageElement => cy.get(`[href="/${migration}"]`)
