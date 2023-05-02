import Page, { PageElement } from './page'

export default class IndexPage extends Page {
  constructor() {
    super('NOMIS migration and synchronisation dashboard')
  }

  headerUserName = (): PageElement => cy.get('[data-qa=header-user-name]')

  visitsMigrationLink = (): PageElement => cy.get('[href="/visits-migration"]')

  visitRoomMappingsLink = (): PageElement => cy.get('[href="/visits-room-mappings-prison"]')

  sentencingMigrationLink = (): PageElement => cy.get('[href="/sentencing-migration"]')

  appointmentsMigrationLink = (): PageElement => cy.get('[href="/appointments-migration"]')
}
