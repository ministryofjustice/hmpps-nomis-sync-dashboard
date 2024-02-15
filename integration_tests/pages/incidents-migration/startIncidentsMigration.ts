import Page from '../page'

export default class StarIncidentsMigrationPage extends Page {
  constructor() {
    super('Start a new incidents migration')
  }

  continueButton = () => cy.get('[data-qa=continue-button]')

  fromDate = () => cy.get('#fromDate')

  toDate = () => cy.get('#toDate')

  errorSummary = () => cy.get('.govuk-error-summary')

  estimateSummary = () => cy.get('#estimateSummary')
}
