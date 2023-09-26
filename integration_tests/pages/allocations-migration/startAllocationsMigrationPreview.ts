import Page from '../page'

export default class StartAllocationsMigrationPage extends Page {
  constructor() {
    super('Start a new allocations migration - preview')
  }

  startMigrationButton = () => cy.contains('Start migration')

  estimateSummary = () => cy.get('#estimateSummary')

  dlqWarning = () => cy.get('#dlqWarning')

  clearDlqMessages = () => cy.get('[data-qa=delete-dlq-button]')
}
