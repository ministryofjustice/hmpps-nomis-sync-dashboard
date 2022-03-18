import Page, { PageElement } from './page'

export default class IndexPage extends Page {
  constructor() {
    super('NOMIS migration and synchronisation dashboard')
  }

  headerUserName = (): PageElement => cy.get('[data-qa=header-user-name]')

  visitsMigrationLink = (): PageElement => cy.get('[href="/visits-migration"]')
}
