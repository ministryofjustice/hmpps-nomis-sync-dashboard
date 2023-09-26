import Page from '../page'

export default class StarAllocationsMigrationPage extends Page {
  constructor() {
    super('Start a new allocations migration')
  }

  continueButton = () => cy.get('[data-qa=continue-button]')

  prisonId = () => cy.get('#prisonId')

  courseActivityId = () => cy.get('#courseActivityId')

  errorSummary = () => cy.get('.govuk-error-summary')

  estimateSummary = () => cy.get('#estimateSummary')
}
