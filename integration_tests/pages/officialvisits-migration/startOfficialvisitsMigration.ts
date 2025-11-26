import Page from '../page'

export default class StartOfficialvisitsMigrationPage extends Page {
  constructor() {
    super('Start a new Official Visits migration')
  }

  continueButton = () => cy.get('[data-qa=continue-button]')

  fromDate = () => cy.get('#fromDate')

  toDate = () => cy.get('#toDate')

  errorSummary = () => cy.get('.govuk-error-summary')

  estimateSummary = () => cy.get('#estimateSummary')
}
