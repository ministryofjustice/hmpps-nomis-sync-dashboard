import Page from '../page'

export default class StartPrisonPersonMigrationPage extends Page {
  constructor() {
    super('Start a new Prison Person migration')
  }

  continueButton = () => cy.get('[data-qa=continue-button]')

  prisonerNumber = () => cy.get('#prisonerNumber')

  errorSummary = () => cy.get('.govuk-error-summary')

  estimateSummary = () => cy.get('#estimateSummary')
}
