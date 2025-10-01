import Page from '../page'

export default class StartPrisonerBalanceMigrationConfirmationPage extends Page {
  constructor() {
    super('Prisoner balance migration started')
  }

  confirmationMessage = () => cy.get('#confirmationMessage')

  detailsLink = () => cy.get('[data-qa=details-link]')
}
