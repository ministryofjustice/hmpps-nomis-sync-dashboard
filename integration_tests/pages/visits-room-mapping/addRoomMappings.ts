import Page, { PageElement } from '../page'

export default class AddRoomMappingPage extends Page {
  constructor(prisonId: string, roomId: string) {
    super(`Add room mapping for Nomis room: ${roomId} at Prison ${prisonId}`)
  }

  vsipIdEntry = () => cy.get('#vsipId')

  addMapping = (): PageElement => cy.contains('add mapping')

  static checkOnPage(prisonId: string, roomId: string): AddRoomMappingPage {
    return this.verifyOnPageWithTwoTitleParams(AddRoomMappingPage, prisonId, roomId)
  }
}
