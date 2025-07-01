import Page, { PageElement } from '../page'

export default class StartContactPersonMigrationPreviewPage extends Page {
  constructor() {
    super('Start a new CPrisoner Restriction migration - preview')
  }

  startMigrationButton = () => cy.contains('Start migration')

  fromDateChangeLink = (): PageElement => cy.get('[data-qa=created-after]')

  fromDateRow = (): PageElement => cy.get('[data-qa=created-after]').parent().parent()

  estimateSummary = () => cy.get('#estimateSummary')

  dlqWarning = () => cy.get('#dlqWarning')
}
