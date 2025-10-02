import Page, { PageElement } from '../page'

export default class PrisonerBalanceMigrationDetailsPage extends Page {
  constructor() {
    super('Prisoner balance migration details')
  }

  status = (): PageElement => cy.get('.status')

  ended = (): PageElement => cy.get('.ended')

  migrated = (): PageElement => cy.get('.migrated')

  stillToBeProcessed = (): PageElement => cy.get('.still-processed')

  failed = (): PageElement => cy.get('.failed')

  cancel = (): PageElement => cy.get('[data-qa=cancel-migration-button]')

  filterPrisonId = (): PageElement => cy.get('[data-qa=filterPrisonId]')

  static goTo(migrationId: string): PrisonerBalanceMigrationDetailsPage {
    cy.visit(`/prisoner-balance-migration/details?migrationId=${migrationId}`)
    return Page.verifyOnPage(PrisonerBalanceMigrationDetailsPage)
  }
}
