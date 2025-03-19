import Page from '../page'

export default class StartMigrationPage extends Page {
  constructor() {
    super('Start a new Contact Person Profile Details migration')
  }

  continueButton = () => cy.get('[data-qa=continue-button]')

  prisonerNumber = () => cy.get('#prisonerNumber')

  errorSummary = () => cy.get('.govuk-error-summary')

  estimateSummary = () => cy.get('#estimateSummary')
}
