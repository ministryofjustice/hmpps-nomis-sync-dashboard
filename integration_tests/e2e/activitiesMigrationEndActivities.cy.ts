import Page from '../pages/page'
import IndexPage from '../pages'
import ActivitiesMigrationPage from '../pages/activities-migration/activitiesMigration'

context('End Activities', () => {
  beforeEach(() => {
    cy.task('reset')
    cy.task('stubSignIn', { roles: ['ROLE_MIGRATE_ACTIVITIES'] })
    cy.task('stubListOfActivitiesMigrationHistory')
    cy.signIn()
    const indexPage = Page.verifyOnPage(IndexPage)
    indexPage.activitiesMigrationLink().click()
  })

  it('should display OK result', () => {
    cy.task('stubEndActivities', 200)

    const activitiesPage = Page.verifyOnPage(ActivitiesMigrationPage)
    let row = activitiesPage.migrationResultsRow(0)
    activitiesPage.endNomisActivities(row).click()

    row = activitiesPage.migrationResultsRow(0)
    const result = activitiesPage.endActivitiesResult(row)

    result.should('contain.text', 'OK')
    result.should('have.class', 'result-success')
  })

  it('should display Not Found result', () => {
    cy.task('stubEndActivities', 404)

    const activitiesPage = Page.verifyOnPage(ActivitiesMigrationPage)
    let row = activitiesPage.migrationResultsRow(0)
    activitiesPage.endNomisActivities(row).click()

    row = activitiesPage.migrationResultsRow(0)
    const result = activitiesPage.endActivitiesResult(row)

    result.should('contain.text', 'Not found')
    result.should('have.class', 'result-error')
  })

  it('should display Error result', () => {
    cy.task('stubEndActivities', 500)

    const activitiesPage = Page.verifyOnPage(ActivitiesMigrationPage)
    let row = activitiesPage.migrationResultsRow(0)
    activitiesPage.endNomisActivities(row).click()

    row = activitiesPage.migrationResultsRow(0)
    const result = activitiesPage.endActivitiesResult(row)

    result.should('contain.text', 'Error')
    result.should('have.class', 'result-error')
  })
})
