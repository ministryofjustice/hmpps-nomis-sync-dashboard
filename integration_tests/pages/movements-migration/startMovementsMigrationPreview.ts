import Page, { PageElement } from '../page'

export default class StartMovementsMigrationPreviewPage extends Page {
  constructor() {
    super('Start a new Temporary Absence migration - preview')
  }

  startMigrationButton = () => cy.contains('Start migration')

  prisonerChangeLink = (): PageElement => cy.get('[data-qa=prisoner-number]')

  prisonerRow = (): PageElement => cy.get('[data-qa=prisoner-number]').parent().parent()

  estimateSummary = () => cy.get('#estimateSummary')

  dlqWarning = () => cy.get('#dlqWarning')
}
