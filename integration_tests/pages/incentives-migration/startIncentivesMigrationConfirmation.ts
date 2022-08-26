import Page from '../page'

export default class StartIncentivesMigrationConfirmationPage extends Page {
  constructor() {
    super('Incentives migration started')
  }

  confirmationMessage = () => cy.get('#confirmationMessage')

  detailsLink = () => cy.get('[data-qa=details-link]')
}
