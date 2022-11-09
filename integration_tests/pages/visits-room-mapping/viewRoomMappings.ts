import Page, { PageElement } from '../page'

export default class VisitRoomMappingPage extends Page {
  constructor() {
    super(`Room mappings - HEI`)
  }

  rows = (): PageElement => cy.get('table tbody tr')

  static goTo(prisonId: string): VisitRoomMappingPage {
    cy.visit(`/visits-room-mappings?prisonId=${prisonId}`)
    return Page.verifyOnPage(VisitRoomMappingPage)
  }
}
