import Page from '../page'

export default class StartVisitslotsMigrationConfirmationPage extends Page {
  constructor() {
    super('Visit Time Slots migration started')
  }

  confirmationMessage = () => cy.get('#confirmationMessage')

  detailsLink = () => cy.get('[data-qa=details-link]')
}
