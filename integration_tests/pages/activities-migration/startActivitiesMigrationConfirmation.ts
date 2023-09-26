import Page from '../page'

export default class StartActivitiesMigrationConfirmationPage extends Page {
  constructor() {
    super('Activities migration started')
  }

  confirmationMessage = () => cy.get('#confirmationMessage')

  detailsLink = () => cy.get('[data-qa=details-link]')
}
