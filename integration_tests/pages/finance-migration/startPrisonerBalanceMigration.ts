import Page from '../page'

export default class StartPrisonerBalanceMigrationPage extends Page {
  constructor() {
    super('Start a new prisoner balance migration')
  }

  continueButton = () => cy.get('[data-qa=continue-button]')

  prisonId = () => cy.get('#prisonId')

  errorSummary = () => cy.get('.govuk-error-summary')

  estimateSummary = () => cy.get('#estimateSummary')
}
