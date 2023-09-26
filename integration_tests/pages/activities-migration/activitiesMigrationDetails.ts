import Page, { PageElement } from '../page'

export default class ActivitiesMigrationDetailsPage extends Page {
  constructor() {
    super('Activities migration details')
  }

  status = (): PageElement => cy.get('.status')

  ended = (): PageElement => cy.get('.ended')

  migrated = (): PageElement => cy.get('.migrated')

  stillToBeProcessed = (): PageElement => cy.get('.still-processed')

  failed = (): PageElement => cy.get('.failed')

  cancel = (): PageElement => cy.get('[data-qa=cancel-migration-button]')

  static goTo(migrationId: string): ActivitiesMigrationDetailsPage {
    cy.visit(`/activities-migration/details?migrationId=${migrationId}`)
    return Page.verifyOnPage(ActivitiesMigrationDetailsPage)
  }
}
