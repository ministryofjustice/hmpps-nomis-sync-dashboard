import { PageElement } from '../page'
import CopyTextPage from '../copyTextPage'

export default class StartAppointmentsMigrationPreviewPage extends CopyTextPage {
  constructor() {
    super('Start a new appointments migration - preview')
  }

  private nomisAppointmentCountsId = '#nomisAppointmentCounts'

  startMigrationButton = () => cy.contains('Start migration')

  fromDateChangeLink = (): PageElement => cy.get('[data-qa=created-after]')

  fromDateRow = (): PageElement => cy.get('[data-qa=created-after]').parent().parent()

  estimateSummary = () => cy.get('#estimateSummary')

  dlqWarning = () => cy.get('#dlqWarning')

  clearDlqMessages = () => cy.get('[data-qa=delete-dlq-button]')

  nomisFeatureSwitch = (prisonId: string) => cy.get(`#nomisFeatureSwitch-${prisonId}`)

  activateFeatureSwitch = (prisonId: string) => cy.get(`[data-qa=activate-prison-button-${prisonId}]`)

  nomisAppointmentCounts = () => cy.get(this.nomisAppointmentCountsId)

  testCopyNomisAppointmentCountsToClipboard = (contents: string) =>
    this.testCopyToClipboard(this.nomisAppointmentCountsId, contents)
}
