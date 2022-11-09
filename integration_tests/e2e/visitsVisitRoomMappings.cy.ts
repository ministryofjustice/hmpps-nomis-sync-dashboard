import VisitsMappingsPage from '../pages/visits-room-mapping/viewRoomMappings'
import Page from '../pages/page'
import IndexPage from '../pages'

context('Visit Room Mappings', () => {
  beforeEach(() => {
    cy.task('reset')
    cy.task('stubAuthUser')
  })

  context('With VISIT MAPPINGS role', () => {
    beforeEach(() => {
      cy.task('stubSignIn', ['ROLE_TEST_ROLE'])
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
    })
  })
})
