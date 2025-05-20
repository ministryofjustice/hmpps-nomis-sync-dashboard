import moment from 'moment'
import Page from '../../pages/page'
import ActivitiesMigrationPage from '../../pages/activities-migration/activitiesMigration'
import MoveActivityStartDatePage from '../../pages/activities-migration/moveActivityStartDate'
import { MigrationHistory } from '../../../server/@types/migration'

context('Move Start Date', () => {
  const today = moment().format('YYYY-MM-DD')
  const tomorrow = moment().add(1, 'days').format('YYYY-MM-DD')
  const aMigration = (filter: string): MigrationHistory => {
    return {
      migrationId: '2022-03-14T10:13:56',
      whenStarted: '2022-03-14T10:13:56.878627',
      whenEnded: '2022-03-14T10:14:07.531409',
      estimatedRecordCount: 5,
      filter,
      recordsMigrated: 5,
      recordsFailed: 0,
      migrationType: 'ACTIVITIES',
      status: 'COMPLETED',
      id: '2022-03-14T10:13:56',
      isNew: false,
    }
  }
  const aFilter = (activityStartDate?: string, nomisActivityEndDate?: string) => {
    return {
      prisonId: 'MDI',
      activityStartDate,
      nomisActivityEndDate,
    }
  }

  beforeEach(() => {
    cy.task('reset')
    cy.task('stubSignIn', { roles: ['ROLE_MIGRATE_ACTIVITIES'] })
    cy.signIn()
    cy.task('stubGetMigrationHistory', {
      migrationType: 'ACTIVITIES',
      history: [aMigration(JSON.stringify(aFilter(tomorrow, today)))],
    })
    ActivitiesMigrationPage.goTo()
  })

  it('should show end activities button if no end date in filter', () => {
    cy.task('stubGetMigrationHistory', {
      migrationType: 'ACTIVITIES',
      history: [aMigration(JSON.stringify(aFilter(tomorrow)))],
    })
    cy.reload()

    const activitiesPage = Page.verifyOnPage(ActivitiesMigrationPage)
    const row = activitiesPage.migrationResultsRow(0)

    activitiesPage.endNomisActivities(row).should('be.visible')
    activitiesPage.moveStartDate(row).should('not.exist')
  })

  it('should show move start date button if end date in filter', () => {
    const activitiesPage = Page.verifyOnPage(ActivitiesMigrationPage)
    const row = activitiesPage.migrationResultsRow(0)

    activitiesPage.moveStartDate(row).should('be.visible')
    activitiesPage.endNomisActivities(row).should('not.exist')
  })

  it('should display validation error for start date', () => {
    const activitiesPage = Page.verifyOnPage(ActivitiesMigrationPage)
    const row = activitiesPage.migrationResultsRow(0)

    cy.task('stubGetActivityMigration', {
      response: aMigration(JSON.stringify(aFilter(tomorrow, today))),
      status: '200',
    })
    activitiesPage.moveStartDate(row).click()

    const moveStartDatePage = Page.verifyOnPage(MoveActivityStartDatePage)
    moveStartDatePage.newActivityStartDateInput().clear().type('invalid-date')
    moveStartDatePage.moveStartDateButton().click()

    moveStartDatePage.errorSummary().should('be.visible')
  })

  it('should display warnings returned from move start dates', () => {
    const twoDaysTime = moment().add(2, 'days').format('YYYY-MM-DD')
    const activitiesPage = Page.verifyOnPage(ActivitiesMigrationPage)
    const row = activitiesPage.migrationResultsRow(0)

    cy.task('stubGetActivityMigration', {
      response: aMigration(JSON.stringify(aFilter(tomorrow, today))),
      status: '200',
    })
    activitiesPage.moveStartDate(row).click()

    cy.task('stubMoveStartDate', { status: '200', warnings: ['Warning 1', 'Warning 2'] })
    const moveStartDatePage = Page.verifyOnPage(MoveActivityStartDatePage)
    moveStartDatePage.newActivityStartDateInput().clear().type(twoDaysTime)

    cy.task('stubGetMigrationHistory', {
      migrationType: 'ACTIVITIES',
      history: [aMigration(JSON.stringify(aFilter(twoDaysTime, tomorrow)))],
    })
    moveStartDatePage.moveStartDateButton().click()

    const updatedActivitiesPage = Page.verifyOnPage(ActivitiesMigrationPage)
    updatedActivitiesPage.warnings().should('be.visible')
  })

  it('should handle API error', () => {
    const activitiesPage = Page.verifyOnPage(ActivitiesMigrationPage)
    const row = activitiesPage.migrationResultsRow(0)

    cy.task('stubGetActivityMigration', {
      response: aMigration(JSON.stringify(aFilter(tomorrow, today))),
      status: '200',
    })
    activitiesPage.moveStartDate(row).click()

    cy.task('stubMoveStartDate', { status: '500' })
    const moveStartDatePage = Page.verifyOnPage(MoveActivityStartDatePage)
    moveStartDatePage.newActivityStartDateInput().clear().type('invalid-date')
    moveStartDatePage.moveStartDateButton().click()

    moveStartDatePage.errorSummary().should('be.visible')
  })
})
