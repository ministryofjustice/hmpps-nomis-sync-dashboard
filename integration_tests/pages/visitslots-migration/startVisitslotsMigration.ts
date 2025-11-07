import Page from '../page'

export default class StartVisitslotsMigrationPage extends Page {
  constructor() {
    super('Start a new Visit Time Slots migration')
  }

  continueButton = () => cy.get('[data-qa=continue-button]')

  errorSummary = () => cy.get('.govuk-error-summary')

  estimateSummary = () => cy.get('#estimateSummary')
}
