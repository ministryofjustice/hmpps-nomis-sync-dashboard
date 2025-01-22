import Page from '../page'

export default class StartCorePersonMigrationPage extends Page {
  constructor() {
    super('Start a new Core Person migration')
  }

  continueButton = () => cy.get('[data-qa=continue-button]')

  errorSummary = () => cy.get('.govuk-error-summary')

  estimateSummary = () => cy.get('#estimateSummary')
}
