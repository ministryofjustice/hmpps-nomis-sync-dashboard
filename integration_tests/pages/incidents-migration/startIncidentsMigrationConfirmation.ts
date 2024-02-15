import Page from '../page'

export default class StartIncidentsMigrationConfirmationPage extends Page {
  constructor() {
    super('Incidents migration started')
  }

  confirmationMessage = () => cy.get('#confirmationMessage')

  detailsLink = () => cy.get('[data-qa=details-link]')
}
