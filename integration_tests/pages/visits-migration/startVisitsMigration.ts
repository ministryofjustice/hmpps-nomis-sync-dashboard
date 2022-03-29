import Page from '../page'

export default class StartVisitsMigrationPage extends Page {
  constructor() {
    super('Start a new visits migration')
  }

  private checkbox = (text: string) => cy.contains('label', text).prev()

  startMigrationButton = () => cy.get('[data-qa=start-migration-button]')

  viewEstimatedCountButton = () => cy.get('[data-qa=view-estimated-count-button]')

  prisonIds = () => cy.get('#prisonIds')

  socialVisitType = () => this.checkbox('Social visits')

  officalVisitType = () => this.checkbox('Official visits')

  fromDateTime = () => cy.get('#fromDateTime')

  toDateTime = () => cy.get('#toDateTime')

  errorSummary = () => cy.get('.govuk-error-summary')

  estimateSummary = () => cy.get('#estimateSummary')
}
