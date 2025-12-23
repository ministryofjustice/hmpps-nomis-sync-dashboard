import { expect, test } from '@playwright/test'

import { login, resetStubs } from '../../testUtils'

import nomisMigrationApi from '../../mockApis/nomisMigrationApi'
import IndexPage from '../../pages/indexPage'
import nomisPrisonerApi from '../../mockApis/nomisPrisonerApi'
import { visitsMigrationHistory } from '../../mockApis/nomisVisitsMigrationApi'
import mappingApi from '../../mockApis/mappingApi'
import VisitRoomMappingPage from '../../pages/visits/visitRoomMappingPage'
import AddRoomMappingPage from '../../pages/visits/addRoomMappingPage'
import AuthErrorPage from '../../pages/authErrorPage'

const migrationType: string = 'VISITS'
const migrationTypeName: string = 'Visit room mappings'

test.describe('Visit Room Mappings', () => {
  test.afterEach(async () => {
    await resetStubs()
  })

  test.describe('With VISIT MAPPINGS role', () => {
    test.beforeEach(async ({ page }) => {
      await nomisMigrationApi.stubGetMigrationHistory({ migrationType, history: visitsMigrationHistory })
      await login(page, { roles: ['ROLE_MIGRATE_VISITS'] })
      const indexPage = await IndexPage.verifyOnPage(page)
      await indexPage.link(migrationTypeName).click()
    })

    test('should view mappings', async ({ page }) => {
      await mappingApi.stubGetVisitRoomMappings('HEI')
      await nomisPrisonerApi.stubGetVisitRoomUsage('HEI')

      const visitRoomMappingPage = await VisitRoomMappingPage.goto('HEI', page)
      await expect(visitRoomMappingPage.rows).toHaveCount(6)
      await expect(page.getByTestId('delete-button-HEI-OPEN-1')).toBeVisible()
      await expect(page.getByTestId('add-button-HEI-CLOSED-1')).toBeVisible()
      await expect(page.getByTestId('add-button-HEI-OPEN-2')).toBeVisible()
      await expect(page.getByTestId('delete-button-HEI-CLOSED-2')).toBeVisible()
      await expect(page.getByTestId('add-button-HEI-OPEN-3')).toBeVisible()

      await expect(page.getByTestId('add-button-HEI-OPEN-1')).toBeHidden()
      await expect(page.getByTestId('delete-button-HEI-CLOSED-1')).toBeHidden()
      await expect(page.getByTestId('delete-button-HEI-OPEN-2')).toBeHidden()
      await expect(page.getByTestId('add-button-HEI-CLOSED-2')).toBeHidden()
      await expect(page.getByTestId('delete-button-HEI-OPEN-3')).toBeHidden()
    })

    test('should allow addition of a new mapping', async ({ page }) => {
      await mappingApi.stubGetVisitRoomMappings('HEI')
      await nomisPrisonerApi.stubGetVisitRoomUsage('HEI')
      await mappingApi.stubAddVisitsRoomMapping('HEI')

      await VisitRoomMappingPage.goto('HEI', page)
      await page.getByTestId('add-button-HEI-OPEN-3').click()

      const addRoomMappingPage = await AddRoomMappingPage.verifyOnPage('HEI', page)
      await addRoomMappingPage.vsipIdEntry.fill('VSIP Open 3')
      await addRoomMappingPage.addMapping.click()
      await VisitRoomMappingPage.verifyOnPage('HEI', page)
    })
  })

  test.describe('Without MIGRATE_VISITS role', () => {
    test.beforeEach(async ({ page }) => {
      await nomisMigrationApi.stubGetMigrationHistory({ migrationType })
      await login(page, { roles: ['ROLE_MIGRATE_PRISONERS'] })
    })
    test('should not see migrate room mappings tile', async ({ page }) => {
      const indexPage = await IndexPage.verifyOnPage(page)
      await expect(indexPage.link(migrationTypeName)).toBeHidden()
    })
    test('should not be able to navigate directly to the room mappings migration page', async ({ page }) => {
      await page.goto('/visits-room-mappings/prison')
      await AuthErrorPage.verifyOnPage(page)
    })
  })
})
