import Page from '../page'

export default class StarAppointmentsMigrationPage extends Page {
  constructor() {
    super('Start a new appointments migration')
  }

  continueButton = () => cy.get('[data-qa=continue-button]')

  prisonIds = () => cy.get('#prisonIds')

  fromDate = () => cy.get('#fromDate')

  toDate = () => cy.get('#toDate')

  errorSummary = () => cy.get('.govuk-error-summary')

  estimateSummary = () => cy.get('#estimateSummary')
}
