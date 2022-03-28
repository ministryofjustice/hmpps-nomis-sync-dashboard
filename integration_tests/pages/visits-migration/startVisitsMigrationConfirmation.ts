import Page from '../page'

export default class StartVisitsMigrationConfirmationPage extends Page {
  constructor() {
    super('Visits migration started')
  }

  confirmationMessage = () => cy.get('#confirmationMessage')

  detailsLink = () => cy.get('[data-qa=details-link]')
}
