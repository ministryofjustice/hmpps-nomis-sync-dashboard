import Page from '../page'

export default class StartAppointmentsMigrationConfirmationPage extends Page {
  constructor() {
    super('Appointments migration started')
  }

  confirmationMessage = () => cy.get('#confirmationMessage')

  detailsLink = () => cy.get('[data-qa=details-link]')
}
