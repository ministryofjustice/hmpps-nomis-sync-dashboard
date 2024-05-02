import Page from '../page'

export default class StartCSIPMigrationConfirmationPage extends Page {
  constructor() {
    super('CSIP migration started')
  }

  confirmationMessage = () => cy.get('#confirmationMessage')

  detailsLink = () => cy.get('[data-qa=details-link]')
}
