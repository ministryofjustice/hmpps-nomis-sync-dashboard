import Page from '../page'

export default class StartVisitBalanceMigrationConfirmationPage extends Page {
  constructor() {
    super('Visit balance migration started')
  }

  confirmationMessage = () => cy.get('#confirmationMessage')

  detailsLink = () => cy.get('[data-qa=details-link]')
}
