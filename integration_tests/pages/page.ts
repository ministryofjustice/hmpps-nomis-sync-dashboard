export type PageElement = Cypress.Chainable<JQuery>

export default abstract class Page {
  static verifyOnPage<T>(constructor: new () => T): T {
    return new constructor()
  }

  static verifyOnPageWithTitleParam<T>(constructor: new (param1) => T, param: string): T {
    return new constructor(param)
  }

  static verifyOnPageWithTwoTitleParams<T>(constructor: new (param1, param2) => T, param1: string, param2: string): T {
    return new constructor(param1, param2)
  }

  constructor(private readonly title: string) {
    this.checkOnPage()
  }

  checkOnPage(): void {
    cy.get('h1').contains(this.title)
  }

  signOut = (): PageElement => cy.get('[data-qa=signOut]')

  manageDetails = (): PageElement => cy.get('[data-qa=manageDetails]')
}
