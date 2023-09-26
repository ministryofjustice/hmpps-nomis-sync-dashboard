import Page, { PageElement } from '../page'

export default class StartAllocationsMigrationPage extends Page {
  constructor() {
    super('Start a new allocations migration - preview')
  }

  startMigrationButton = () => cy.contains('Start migration')

  prisonIdChangeLink = (): PageElement => cy.get('[data-qa=prison-id]')

  prisonIdRow = (): PageElement => cy.get('[data-qa=prison-id]').parent().parent()

  courseActivityIdRow = (): PageElement => cy.get('[data-qa=course-activity-id]').parent().parent()

  estimateSummary = () => cy.get('#estimateSummary')

  dlqWarning = () => cy.get('#dlqWarning')

  clearDlqMessages = () => cy.get('[data-qa=delete-dlq-button]')
}
