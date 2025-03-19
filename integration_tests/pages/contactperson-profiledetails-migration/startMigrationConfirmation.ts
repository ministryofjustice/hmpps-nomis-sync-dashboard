import Page from '../page'

export default class StartMigrationConfirmationPage extends Page {
  constructor() {
    super('Contact Person Profile Details migration started')
  }

  confirmationMessage = () => cy.get('#confirmationMessage')

  detailsLink = () => cy.get('[data-qa=details-link]')
}
