import { expect, test } from '@playwright/test'

import { login, resetStubs } from '../../testUtils'

import nomisMigrationApi from '../../mockApis/nomisMigrationApi'
import IndexPage from '../../pages/indexPage'
import nomisActivitiesMigrationApi, { activitiesMigrationHistory } from '../../mockApis/nomisActivitiesMigrationApi'
import ActivitiesMigrationPage from '../../pages/activities/activitiesMigrationPage'

const migrationType: string = 'ACTIVITIES'
const migrationTypeName: string = 'Activities'

test.describe('End Activities', () => {
  test.afterEach(async () => {
    await resetStubs()
  })
  test.beforeEach(async ({ page }) => {
    await login(page, { roles: ['ROLE_MIGRATE_ACTIVITIES'] })
    const indexPage = await IndexPage.verifyOnPage(page)
    await nomisMigrationApi.stubGetMigrationHistory({ migrationType, history: activitiesMigrationHistory })
    await indexPage.migrationLink(migrationTypeName).click()
  })

  test('should display OK result', async ({ page }) => {
    await nomisActivitiesMigrationApi.stubEndActivities('200')

    const activitiesPage = await ActivitiesMigrationPage.verifyOnPage(migrationTypeName, page)
    const row = activitiesPage.migrationResultsRow(0)
    await activitiesPage.endNomisActivities(row).click()

    const rowNew = activitiesPage.migrationResultsRow(0)
    const result = activitiesPage.endActivitiesResult(rowNew)
    await expect(result).toHaveText('OK')
    await expect(result).toHaveClass('result-success')
  })

  test('should display Not Found result', async ({ page }) => {
    await nomisActivitiesMigrationApi.stubEndActivities('404')

    const activitiesPage = await ActivitiesMigrationPage.verifyOnPage(migrationTypeName, page)
    const row = activitiesPage.migrationResultsRow(0)
    await activitiesPage.endNomisActivities(row).click()

    const rowNew = activitiesPage.migrationResultsRow(0)
    const result = activitiesPage.endActivitiesResult(rowNew)
    await expect(result).toHaveText('Not found')
    await expect(result).toHaveClass('result-error')
  })

  test('should display Error result', async ({ page }) => {
    await nomisActivitiesMigrationApi.stubEndActivities('500')

    const activitiesPage = await ActivitiesMigrationPage.verifyOnPage(migrationTypeName, page)
    const row = activitiesPage.migrationResultsRow(0)
    await activitiesPage.endNomisActivities(row).click()

    const rowNew = activitiesPage.migrationResultsRow(0)
    const result = activitiesPage.endActivitiesResult(rowNew)
    await expect(result).toHaveText('Error')
    await expect(result).toHaveClass('result-error')
  })
})
