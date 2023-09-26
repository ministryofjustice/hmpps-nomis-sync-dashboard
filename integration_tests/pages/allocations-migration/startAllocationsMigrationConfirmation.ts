import Page from '../page'

export default class StartAllocationsMigrationConfirmationPage extends Page {
  constructor() {
    super('Allocations migration started')
  }

  confirmationMessage = () => cy.get('#confirmationMessage')

  detailsLink = () => cy.get('[data-qa=details-link]')
}
