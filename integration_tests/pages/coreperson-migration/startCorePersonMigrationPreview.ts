import Page from '../page'

export default class StartCorePersonMigrationPreviewPage extends Page {
  constructor() {
    super('Start a new Core Person migration - preview')
  }

  startMigrationButton = () => cy.contains('Start migration')

  estimateSummary = () => cy.get('#estimateSummary')

  dlqWarning = () => cy.get('#dlqWarning')
}
