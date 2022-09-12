import VisitOptions = Cypress.VisitOptions

Cypress.Commands.add('signIn', (options?: Partial<VisitOptions>) => {
  cy.request(`/`)
  cy.task('getSignInUrl').then((url: string) => cy.visit(url, options))
})
