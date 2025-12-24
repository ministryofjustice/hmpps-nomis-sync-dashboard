import { expect, test } from '@playwright/test'

import moment from 'moment'
import { login } from '../../testUtils'

import nomisMigrationApi from '../../mockApis/nomisMigrationApi'
import IndexPage from '../../pages/indexPage'
import nomisActivitiesMigrationApi from '../../mockApis/nomisActivitiesMigrationApi'
import ActivitiesMigrationPage from '../../pages/activities/activitiesMigrationPage'
import { MigrationHistory } from '../../../server/@types/migration'
import MoveActivityStartDate from '../../pages/activities/moveActivityStartDate'

const migrationType: string = 'ACTIVITIES'
const migrationTypeName: string = 'Activities'

test.describe('Move Start Date', () => {
  const today = moment().format('YYYY-MM-DD')
  const tomorrow = moment().add(1, 'days').format('YYYY-MM-DD')
  const twoDaysTime = moment().add(2, 'days').format('YYYY-MM-DD')
  const aMigration = (filter: string): MigrationHistory => ({
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
  })
  const aFilter = (activityStartDate?: string, nomisActivityEndDate?: string) => ({
    prisonId: 'MDI',
    activityStartDate,
    nomisActivityEndDate,
  })

  test.beforeEach(async ({ page }) => {
    await login(page, { roles: ['ROLE_MIGRATE_ACTIVITIES'] })
    const indexPage = await IndexPage.verifyOnPage(page)
    await nomisMigrationApi.stubGetMigrationHistory({
      migrationType,
      history: [aMigration(JSON.stringify(aFilter(tomorrow, today)))],
    })
    await indexPage.migrationLink(migrationTypeName).click()
  })

  test('should show end activities button if no end date in filter', async ({ page }) => {
    await nomisMigrationApi.stubGetMigrationHistory({
      migrationType,
      history: [aMigration(JSON.stringify(aFilter(tomorrow)))],
    })
    await page.reload()

    const activitiesPage = await ActivitiesMigrationPage.verifyOnPage(migrationTypeName, page)
    const row = activitiesPage.migrationResultsRow(0)

    await expect(activitiesPage.endNomisActivities(row)).toBeVisible()
    await expect(activitiesPage.moveStartDate(row)).toBeHidden()
  })

  test('should show move start date button if end date in filter', async ({ page }) => {
    const activitiesPage = await ActivitiesMigrationPage.verifyOnPage(migrationTypeName, page)
    const row = activitiesPage.migrationResultsRow(0)

    await expect(activitiesPage.endNomisActivities(row)).toBeHidden()
    await expect(activitiesPage.moveStartDate(row)).toBeVisible()
  })

  test('should display validation error for start date', async ({ page }) => {
    const activitiesPage = await ActivitiesMigrationPage.verifyOnPage(migrationTypeName, page)
    const row = activitiesPage.migrationResultsRow(0)

    await nomisActivitiesMigrationApi.stubGetActivityMigration({
      response: aMigration(JSON.stringify(aFilter(tomorrow, today))),
      status: '200',
    })
    await activitiesPage.moveStartDate(row).click()

    const moveStartDatePage = await MoveActivityStartDate.verifyOnPage(page)
    await moveStartDatePage.newActivityStartDateInput.clear()
    await moveStartDatePage.newActivityStartDateInput.fill('invalid-date')
    await moveStartDatePage.moveStartDateButton.click()

    await expect(moveStartDatePage.errorSummary).toHaveText('Enter a valid date.')
  })

  test('should display warnings returned from move start dates', async ({ page }) => {
    const activitiesPage = await ActivitiesMigrationPage.verifyOnPage(migrationTypeName, page)
    const row = activitiesPage.migrationResultsRow(0)

    await nomisActivitiesMigrationApi.stubGetActivityMigration({
      response: aMigration(JSON.stringify(aFilter(tomorrow, today))),
      status: '200',
    })
    await activitiesPage.moveStartDate(row).click()

    await nomisActivitiesMigrationApi.stubMoveStartDate({ status: '200', warnings: ['Warning 1', 'Warning 2'] })

    const moveStartDatePage = await MoveActivityStartDate.verifyOnPage(page)
    await moveStartDatePage.newActivityStartDateInput.clear()
    await moveStartDatePage.newActivityStartDateInput.fill(twoDaysTime)

    await nomisMigrationApi.stubGetMigrationHistory({
      migrationType,
      history: [aMigration(JSON.stringify(aFilter(twoDaysTime, tomorrow)))],
    })
    await moveStartDatePage.moveStartDateButton.click()

    const updatedActivitiesPage = await ActivitiesMigrationPage.verifyOnPage(migrationTypeName, page)
    await expect(updatedActivitiesPage.warnings).toContainText('Move date succeeded but')
  })

  test('should handle API error', async ({ page }) => {
    const activitiesPage = await ActivitiesMigrationPage.verifyOnPage(migrationTypeName, page)
    const row = activitiesPage.migrationResultsRow(0)

    await nomisActivitiesMigrationApi.stubGetActivityMigration({
      response: aMigration(JSON.stringify(aFilter(tomorrow, today))),
      status: '200',
    })
    await activitiesPage.moveStartDate(row).click()

    await nomisActivitiesMigrationApi.stubMoveStartDate({ status: '500' })
    const moveStartDatePage = await MoveActivityStartDate.verifyOnPage(page)
    await moveStartDatePage.newActivityStartDateInput.clear()
    await moveStartDatePage.newActivityStartDateInput.fill(twoDaysTime)
    await moveStartDatePage.moveStartDateButton.click()

    await expect(moveStartDatePage.errorSummary).toContainText('Internal Server Error')
  })
})
