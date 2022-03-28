import IndexPage from '../pages/index'
import Page from '../pages/page'
import StartVisitsMigrationPage from '../pages/visits-migration/startVisitsMigration'
import StartVisitsMigrationConfirmationPage from '../pages/visits-migration/startVisitsMigrationConfirmation'
import VisitsMigrationPage from '../pages/visits-migration/visitsMigration'

context('Visit Migration Homepage', () => {
  beforeEach(() => {
    cy.task('reset')
    cy.task('stubAuthUser')
  })
  context('With MIGRATE_VISITS role', () => {
    beforeEach(() => {
      cy.task('stubSignIn', ['ROLE_MIGRATE_VISITS'])
      cy.task('stubListOfMigrationHistory')
      cy.signIn()
      const indexPage = Page.verifyOnPage(IndexPage)
      indexPage.visitsMigrationLink().click()
    })
    it('can navigate to start migration page', () => {
      Page.verifyOnPage(VisitsMigrationPage).startNewMigration().click()
      Page.verifyOnPage(StartVisitsMigrationPage)
    })

    it('will validate page when selecting start migration', () => {
      Page.verifyOnPage(VisitsMigrationPage).startNewMigration().click()
      const page = Page.verifyOnPage(StartVisitsMigrationPage)
      page.prisonIds().clear()
      page.fromDateTime().type('invalid')
      page.toDateTime().type('invalid')
      page.socialVisitType().uncheck()
      page.officalVisitType().uncheck()

      page.startMigrationButton().click()

      const pageWithErrors = Page.verifyOnPage(StartVisitsMigrationPage)
      pageWithErrors.errorSummary().contains('Enter the type of visits to migrate')
      pageWithErrors.errorSummary().contains('Enter one or more prison IDs')
      pageWithErrors.errorSummary().contains('Enter a real date time, like 2020-03-23T12:00:00 or 2020-03-23')
    })

    it('will validate page when selecting view estimated count', () => {
      Page.verifyOnPage(VisitsMigrationPage).startNewMigration().click()
      const page = Page.verifyOnPage(StartVisitsMigrationPage)
      page.prisonIds().clear()
      page.fromDateTime().type('invalid')
      page.toDateTime().type('invalid')
      page.socialVisitType().uncheck()
      page.officalVisitType().uncheck()

      page.viewEstimatedCountButton().click()

      const pageWithErrors = Page.verifyOnPage(StartVisitsMigrationPage)
      pageWithErrors.errorSummary().contains('Enter the type of visits to migrate')
      pageWithErrors.errorSummary().contains('Enter one or more prison IDs')
      pageWithErrors.errorSummary().contains('Enter a real date time, like 2020-03-23T12:00:00 or 2020-03-23')
    })
    it('submitting view estimated count with valid form will return back to start page', () => {
      cy.task('stubGetVisitMigrationEstimatedCount', 100_988)

      Page.verifyOnPage(VisitsMigrationPage).startNewMigration().click()
      const page = Page.verifyOnPage(StartVisitsMigrationPage)
      page.prisonIds().type('HEI')
      page.fromDateTime().type('2020-03-23T12:00:00')
      page.toDateTime().type('2020-03-30T10:00:00')
      page.socialVisitType().check()
      page.officalVisitType().uncheck()

      page.viewEstimatedCountButton().click()

      const pageWithEstimate = Page.verifyOnPage(StartVisitsMigrationPage)

      pageWithEstimate.estimateSummary().contains('Estimated number of visits to be migrated: 100,988')
    })

    it('submitting start migration with valid form will start migration', () => {
      cy.task('stubStartVisitsMigration', {
        migrationId: '2022-03-23T11:11:56',
        estimatedCount: 100_988,
      })

      Page.verifyOnPage(VisitsMigrationPage).startNewMigration().click()
      const page = Page.verifyOnPage(StartVisitsMigrationPage)
      page.prisonIds().type('HEI')
      page.fromDateTime().type('2020-03-23T12:00:00')
      page.toDateTime().type('2020-03-30T10:00:00')
      page.socialVisitType().check()
      page.officalVisitType().uncheck()

      page.startMigrationButton().click()

      const confirmationPage = Page.verifyOnPage(StartVisitsMigrationConfirmationPage)
      confirmationPage.confirmationMessage().contains('100,988')
      confirmationPage.confirmationMessage().contains('2022-03-23T11:11:56')
      confirmationPage.detailsLink().contains('View migration status')
    })
  })
})
