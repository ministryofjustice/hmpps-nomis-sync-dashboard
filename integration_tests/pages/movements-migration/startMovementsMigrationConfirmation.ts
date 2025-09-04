import Page from '../page'

export default class StartMovementsMigrationConfirmationPage extends Page {
  constructor() {
    super('Temporary Absences migration started')
  }

  confirmationMessage = () => cy.get('#confirmationMessage')

  detailsLink = () => cy.get('[data-qa=details-link]')
}
