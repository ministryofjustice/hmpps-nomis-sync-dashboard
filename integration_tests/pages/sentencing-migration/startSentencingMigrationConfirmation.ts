import Page from '../page'

export default class StartSentencingMigrationConfirmationPage extends Page {
  constructor() {
    super('Sentencing migration started')
  }

  confirmationMessage = () => cy.get('#confirmationMessage')

  detailsLink = () => cy.get('[data-qa=details-link]')
}
