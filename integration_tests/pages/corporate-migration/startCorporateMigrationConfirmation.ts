import Page from '../page'

export default class StartCorporateMigrationConfirmationPage extends Page {
  constructor() {
    super('Corporate migration started')
  }

  confirmationMessage = () => cy.get('#confirmationMessage')

  detailsLink = () => cy.get('[data-qa=details-link]')
}
