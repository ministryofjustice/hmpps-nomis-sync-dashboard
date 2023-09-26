import Page from '../page'

export default class StartActivitiesMigrationPage extends Page {
  constructor() {
    super('Start a new activities migration - preview')
  }

  startMigrationButton = () => cy.contains('Start migration')

  estimateSummary = () => cy.get('#estimateSummary')

  dlqWarning = () => cy.get('#dlqWarning')

  clearDlqMessages = () => cy.get('[data-qa=delete-dlq-button]')
}
