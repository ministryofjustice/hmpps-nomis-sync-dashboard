import Page, { PageElement } from '../page'

export default class StartPrisonPersonMigrationPreviewPage extends Page {
  constructor() {
    super('Start a new Prison Person migration - preview')
  }

  startMigrationButton = () => cy.contains('Start migration')

  prisonerNumberChangeLink = (): PageElement => cy.get('[data-qa=prisoner-number]')

  prisonerNumberRow = (): PageElement => cy.get('[data-qa=prisoner-number]').parent().parent()

  estimateSummary = () => cy.get('#estimateSummary')

  dlqWarning = () => cy.get('#dlqWarning')

  clearDlqMessages = () => cy.get('[data-qa=delete-dlq-button]')
}
