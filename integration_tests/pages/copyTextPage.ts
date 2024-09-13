import Page from './page'

export default class CopyTextPage extends Page {
  constructor(title) {
    super(title)
  }

  protected testCopyToClipboard = (id: string, contents: string) => {
    // stub out clipboard copying to make it easier to then assert contents
    cy.window()
      .its('navigator.clipboard')
      .then(clipboard => {
        cy.stub(clipboard, 'writeText').as('writeText').returns(Promise.resolve())
      })

    // ensure that our OK link starts off hidden
    cy.get(id).contains('span', 'OK').should('have.class', 'govuk-visually-hidden')

    cy.get(id).contains('a', 'Copy').click()

    cy.get('@writeText').should('be.calledWithExactly', contents)

    // ensure OK text now displayed
    cy.get(id).contains('span', 'OK').should('not.have.class', 'govuk-visually-hidden')
  }
}
