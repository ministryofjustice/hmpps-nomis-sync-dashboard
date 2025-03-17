import Page, { PageElement } from '../page'

export default class StartVisitBalanceMigrationPreviewPage extends Page {
  constructor() {
    super('Start a new visit balance migration - preview')
  }

  startMigrationButton = () => cy.contains('Start migration')

  prisonIdChangeLink = (): PageElement => cy.get('[data-qa=prison-id]')

  prisonIdRow = (): PageElement => cy.get('[data-qa=prison-id]').parent().parent()

  estimateSummary = () => cy.get('#estimateSummary')

  dlqWarning = () => cy.get('#dlqWarning')
}
