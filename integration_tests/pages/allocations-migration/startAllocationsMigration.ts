import Page from '../page'

export default class StartAllocationsMigrationPage extends Page {
  constructor() {
    super('Start a new allocations migration')
  }

  continueButton = () => cy.get('[data-qa=continue-button]')

  prisonId = () => cy.get('#prisonId')

  courseActivityId = () => cy.get('#courseActivityId')

  activityStartDate = () => cy.get('#activityStartDate')

  hiddenActivityStartDate = () => cy.get('[data-qa=hidden-activityStartDate]')

  errorSummary = () => cy.get('.govuk-error-summary')

  estimateSummary = () => cy.get('#estimateSummary')
}
