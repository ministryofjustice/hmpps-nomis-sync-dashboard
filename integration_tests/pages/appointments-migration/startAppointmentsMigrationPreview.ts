import Page, { PageElement } from '../page'

export default class StartAppointmentsMigrationPage extends Page {
  constructor() {
    super('Start a new appointments migration - preview')
  }

  startMigrationButton = () => cy.contains('Start migration')

  fromDateChangeLink = (): PageElement => cy.get('[data-qa=created-after]')

  fromDateRow = (): PageElement => cy.get('[data-qa=created-after]').parent().parent()

  estimateSummary = () => cy.get('#estimateSummary')

  dlqWarning = () => cy.get('#dlqWarning')

  clearDlqMessages = () => cy.get('[data-qa=delete-dlq-button]')
}
