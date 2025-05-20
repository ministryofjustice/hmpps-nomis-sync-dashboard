import Page, { PageElement } from '../page'

export default class MoveActivityStartDatePage extends Page {
  constructor() {
    super('Move activity start date')
  }

  newActivityStartDateInput = (): PageElement => cy.get('#newActivityStartDate')

  moveStartDateButton = (): PageElement => cy.get('[data-qa=move-start-date-button]')

  errorSummary = (): PageElement => cy.get('[data-qa-errors]')
}
