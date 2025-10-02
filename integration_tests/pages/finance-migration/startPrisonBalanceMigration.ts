import Page from '../page'

export default class StartPrisonBalanceMigrationPage extends Page {
  constructor() {
    super('Start a new prison balance migration')
  }

  continueButton = () => cy.get('[data-qa=continue-button]')

  prisonId = () => cy.get('#prisonId')

  errorSummary = () => cy.get('.govuk-error-summary')

  estimateSummary = () => cy.get('#estimateSummary')
}
