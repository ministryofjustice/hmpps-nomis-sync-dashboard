import VisitsMappingsPage from '../../pages/visits-room-mapping/viewRoomMappings'
import Page from '../../pages/page'
import IndexPage from '../../pages'
import AddRoomMappingPage from '../../pages/visits-room-mapping/addRoomMappings'
import AuthErrorPage from '../../pages/authError'

context('Visit Room Mappings', () => {
  beforeEach(() => {
    cy.task('reset')
  })

  context('With VISIT MAPPINGS role', () => {
    beforeEach(() => {
      cy.task('stubSignIn', { roles: ['ROLE_MIGRATE_VISITS'] })
      cy.signIn()
    })
    it('should see visit room mappings tile', () => {
      const indexPage = Page.verifyOnPage(IndexPage)
      indexPage.visitRoomMappingsLink().should('be.visible')
    })
    it('should view mappings', () => {
      cy.task('stubGetVisitRoomMappings', 'HEI')
      cy.task('stubGetVisitRoomUsage', 'HEI')
      const page = VisitsMappingsPage.goTo('HEI')
      page.rows().should('have.length', 5)
      cy.get('[data-qa=delete-button-HEI-OPEN-1]').should('exist')
      cy.get('[data-qa=add-button-HEI-CLOSED-1]').should('exist')
      cy.get('[data-qa=add-button-HEI-OPEN-2]').should('exist')
      cy.get('[data-qa=delete-button-HEI-CLOSED-2]').should('exist')
      cy.get('[data-qa=add-button-HEI-OPEN-3]').should('exist')

      cy.get('[data-qa=add-button-HEI-OPEN-1]').should('not.exist')
      cy.get('[data-qa=delete-button-HEI-CLOSED-1]').should('not.exist')
      cy.get('[data-qa=delete-button-HEI-OPEN-2]').should('not.exist')
      cy.get('[data-qa=add-button-HEI-CLOSED-2]').should('not.exist')
      cy.get('[data-qa=delete-button-HEI-OPEN-3]').should('not.exist')
    })

    it('should allow addition of a new mapping', () => {
      cy.task('stubGetVisitRoomMappings', 'HEI')
      cy.task('stubGetVisitRoomUsage', 'HEI')
      cy.task('stubAddVisitsRoomMapping', 'HEI')
      VisitsMappingsPage.goTo('HEI')
      cy.get('[data-qa=add-button-HEI-OPEN-3]').click()
      const page = AddRoomMappingPage.checkOnPage('HEI', 'HEI-OPEN-3')
      page.vsipIdEntry().type('VSIP Open 3')
      page.addMapping().click()
      VisitsMappingsPage.checkOnPage('HEI')
    })
  })

  context('Without MIGRATE_VISITS role', () => {
    beforeEach(() => {
      cy.task('stubSignIn', { roles: ['ROLE_MIGRATE_PRISONERS'] })
      cy.signIn()
    })
    it('should not see migrate room mappings tile', () => {
      const indexPage = Page.verifyOnPage(IndexPage)
      indexPage.visitRoomMappingsLink().should('not.exist')
    })
    it('should not be able to navigate directly to the room mappings migration page', () => {
      cy.visit('/visits-room-mappings/prison', { failOnStatusCode: false })
      Page.verifyOnPage(AuthErrorPage)
    })
  })
})
