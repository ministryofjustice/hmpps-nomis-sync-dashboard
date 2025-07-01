import Page from '../page'

export default class StartContactPersonMigrationConfirmationPage extends Page {
  constructor() {
    super('Prisoner Restriction migration started')
  }

  confirmationMessage = () => cy.get('#confirmationMessage')

  detailsLink = () => cy.get('[data-qa=details-link]')
}
