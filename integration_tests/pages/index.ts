import Page, { PageElement } from './page'

export default class IndexPage extends Page {
  constructor() {
    super('NOMIS migration and synchronisation dashboard')
  }

  headerUserName = (): PageElement => cy.get('[data-qa=header-user-name]')

  headerPhaseBanner = (): PageElement => cy.get('[data-qa=header-phase-banner]')

  visitsMigrationLink = (): PageElement => cy.get('[href="/visits-migration"]')

  visitRoomMappingsLink = (): PageElement => cy.get('[href="/visits-room-mappings/prison"]')

  sentencingMigrationLink = (): PageElement => cy.get('[href="/sentencing-migration"]')

  appointmentsMigrationLink = (): PageElement => cy.get('[href="/appointments-migration"]')

  activitiesMigrationLink = (): PageElement => cy.get('[href="/activities-migration"]')

  allocationsMigrationLink = (): PageElement => cy.get('[href="/allocations-migration"]')

  incidentsMigrationLink = (): PageElement => cy.get('[href="/incidents-migration"]')

  contactPersonMigrationLink = (): PageElement => cy.get('[href="/contactperson-migration"]')

  contactPersonProfileDetailsMigrationLink = (): PageElement =>
    cy.get('[href="/contactperson-profiledetails-migration"]')

  corporateMigrationLink = (): PageElement => cy.get('[href="/corporate-migration"]')

  visitBalanceMigrationLink = (): PageElement => cy.get('[href="/visit-balance-migration"]')

  movementsBalanceMigrationLink = (): PageElement => cy.get('[href="/movements-migration"]')

  migrationLink = (migration: string): PageElement => cy.get(`[href="/${migration}"]`)
}
