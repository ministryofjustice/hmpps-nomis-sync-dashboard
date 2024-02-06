import Page from '../page'

export default class StartVisitsMigrationPage extends Page {
  constructor() {
    super('Start a new visits migration')
  }

  private checkboxLabel = (text: string) => cy.contains('label', text)

  continueButton = () => cy.get('[data-qa=continue-button]')

  prisonIds = () => cy.get('#prisonIds')

  socialVisitType = () => this.checkboxLabel('Social visits')

  fromDateTime = () => cy.get('#fromDateTime')

  toDateTime = () => cy.get('#toDateTime')

  errorSummary = () => cy.get('.govuk-error-summary')

  estimateSummary = () => cy.get('#estimateSummary')
}
