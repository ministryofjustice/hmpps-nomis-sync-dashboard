import Page from '../page'

export default class StartActivitiesMigrationPage extends Page {
  constructor() {
    super('Start a new activities migration')
  }

  continueButton = () => cy.get('[data-qa=continue-button]')

  prisonId = () => cy.get('#prisonId')

  courseActivityId = () => cy.get('#courseActivityId')

  errorSummary = () => cy.get('.govuk-error-summary')

  estimateSummary = () => cy.get('#estimateSummary')
}
