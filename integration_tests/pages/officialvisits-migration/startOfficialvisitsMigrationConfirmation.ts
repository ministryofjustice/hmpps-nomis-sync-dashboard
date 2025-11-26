import Page from '../page'

export default class StartOfficialvisitsMigrationConfirmationPage extends Page {
  constructor() {
    super('Official Visits migration started')
  }

  confirmationMessage = () => cy.get('#confirmationMessage')

  detailsLink = () => cy.get('[data-qa=details-link]')
}
