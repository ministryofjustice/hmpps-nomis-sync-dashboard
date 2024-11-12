import { PageElement } from '../page'
import CopyTextPage from '../copyTextPage'

export default class StartActivitiesMigrationPreviewPage extends CopyTextPage {
  constructor() {
    super('Start a new activities migration - preview')
  }

  private nomisSuspendedAllocationsId = '#nomisSuspendedAllocations'

  private nomisAllocationsMissingPayBandsId = '#nomisAllocationsMissingPayBands'

  private nomisPayRatesUnknownIncentiveId = '#nomisPayRatesUnknownIncentive'

  private nomisActivitiesWithoutScheduleRules = '#nomisActivitiesWithoutScheduleRules'

  startMigrationButton = () => cy.contains('Start migration')

  prisonIdChangeLink = (): PageElement => cy.get('[data-qa=prison-id]')

  prisonIdRow = (): PageElement => cy.get('[data-qa=prison-id]').parent().parent()

  courseActivityIdRow = (): PageElement => cy.get('[data-qa=course-activity-id]').parent().parent()

  estimateSummary = () => cy.get('#estimateSummary')

  dlqWarning = () => cy.get('#dlqWarning')

  clearDlqMessages = () => cy.get('[data-qa=delete-dlq-button]')

  incentiveLevels = () => cy.get('#incentiveLevels')

  nomisFeatureSwitch = () => cy.get('#nomisFeatureSwitch')

  activateFeatureSwitch = () => cy.get('[data-qa=activate-prison-button]')

  dpsFeatureSwitch = () => cy.get('#dpsFeatureSwitch')

  dpsPayBands = () => cy.get('#dpsPayBands')

  dpsPrisonRegime = () => cy.get('#dpsPrisonRegime')

  nomisSuspendedAllocations = () => cy.get(this.nomisSuspendedAllocationsId)

  nomisAllocationsWithNoPayBands = () => cy.get(this.nomisAllocationsMissingPayBandsId)

  nomisPayRatesUnknownIncentive = () => cy.get(this.nomisPayRatesUnknownIncentiveId)

  activitiesWithoutScheduleRules = () => cy.get(this.nomisActivitiesWithoutScheduleRules)

  errorSummary = () => cy.get('.govuk-error-summary')

  testCopySuspendedAllocationsToClipboard = (contents: string) =>
    this.testCopyToClipboard(this.nomisSuspendedAllocationsId, contents)

  testCopyAllocationsMissingPayBandsToClipboard = (contents: string) =>
    this.testCopyToClipboard(this.nomisAllocationsMissingPayBandsId, contents)

  testCopyPayRatesUnknownIncentiveToClipboard = (contents: string) =>
    this.testCopyToClipboard(this.nomisPayRatesUnknownIncentiveId, contents)

  testCopyActivitiesWithoutScheduleRulesToClipboard = (contents: string) =>
    this.testCopyToClipboard(this.nomisActivitiesWithoutScheduleRules, contents)
}
