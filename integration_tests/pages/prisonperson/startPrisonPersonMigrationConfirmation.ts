import Page from '../page'

export default class StartPrisonPersonMigrationConfirmationPage extends Page {
  constructor() {
    super('Prison Person migration started')
  }

  confirmationMessage = () => cy.get('#confirmationMessage')

  detailsLink = () => cy.get('[data-qa=details-link]')
}
