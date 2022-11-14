import Page, { PageElement } from '../page'

export default class VisitRoomMappingPage extends Page {
  constructor(prisonId: string) {
    super(`Room mappings - ${prisonId}`)
  }

  rows = (): PageElement => cy.get('table tbody tr')

  static checkOnPage(prisonId: string): VisitRoomMappingPage {
    return this.verifyOnPageWithTitleParam(VisitRoomMappingPage, prisonId)
  }

  static goTo(prisonId: string): VisitRoomMappingPage {
    cy.visit(`/visits-room-mappings?prisonId=${prisonId}`)
    return Page.verifyOnPageWithTitleParam(VisitRoomMappingPage, prisonId)
  }
}
