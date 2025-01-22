import Page from '../page'

export default class StartCorePersonMigrationConfirmationPage extends Page {
  constructor() {
    super('Core Person migration started')
  }

  confirmationMessage = () => cy.get('#confirmationMessage')

  detailsLink = () => cy.get('[data-qa=details-link]')
}
