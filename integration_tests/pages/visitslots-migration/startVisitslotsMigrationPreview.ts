import Page from '../page'

export default class StartVisitslotsMigrationPreviewPage extends Page {
  constructor() {
    super('Start a new Visit Time Slots migration - preview')
  }

  startMigrationButton = () => cy.contains('Start migration')

  estimateSummary = () => cy.get('#estimateSummary')

  dlqWarning = () => cy.get('#dlqWarning')
}
