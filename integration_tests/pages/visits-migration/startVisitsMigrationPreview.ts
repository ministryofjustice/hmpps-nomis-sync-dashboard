import Page, { PageElement } from '../page'

export default class StartVisitsMigrationPage extends Page {
  constructor() {
    super('Start a new visits migration - preview')
  }

  startMigrationButton = () => cy.contains('Start migration')

  prisonIds = () => cy.get('#prisonIds')

  fromDateTimeChangeLink = (): PageElement => cy.get('[data-qa=created-after]')

  fromDateTimeRow = (): PageElement => cy.get('[data-qa=created-after]').parent().parent()

  estimateSummary = () => cy.get('#estimateSummary')

  dlqWarning = () => cy.get('#dlqWarning')

  roomsWarning = () => cy.get('#roomsWarning')
}
