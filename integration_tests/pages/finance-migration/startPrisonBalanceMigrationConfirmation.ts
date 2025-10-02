import Page from '../page'

export default class StartPrisonBalanceMigrationConfirmationPage extends Page {
  constructor() {
    super('Prison balance migration started')
  }

  confirmationMessage = () => cy.get('#confirmationMessage')

  detailsLink = () => cy.get('[data-qa=details-link]')
}
