import { expect, test } from '@playwright/test'
import hmppsAuth from '../mockApis/hmppsAuth'
import tokenVerification from '../mockApis/tokenVerification'
import nomisMigrationApi from '../mockApis/nomisMigrationApi'
import nomisPrisonerApi from '../mockApis/nomisPrisonerApi'
import activitiesApi from '../mockApis/activitiesApi'
import mappingApi from '../mockApis/mappingApi'

import { resetStubs } from '../testUtils'

test.describe('Health', () => {
  test.afterEach(async () => {
    await resetStubs()
  })

  test.describe('All healthy', () => {
    test.beforeEach(async () => {
      await Promise.all([
        hmppsAuth.stubPing(),
        nomisMigrationApi.stubPing(),
        nomisPrisonerApi.stubPing(),
        activitiesApi.stubPing(),
        mappingApi.stubPing(),
        tokenVerification.stubPing(),
      ])
    })

    test('Health check is accessible and status is UP', async ({ page }) => {
      const response = await page.request.get('/health')
      const payload = await response.json()
      expect(payload.status).toBe('UP')
    })

    test('Reports nomis prisoner UP', async ({ page }) => {
      const response = await page.request.get('/health')
      const payload = await response.json()
      expect(payload.components.nomisPrisoner.status).toBe('UP')
    })

    test('Ping is accessible and status is UP', async ({ page }) => {
      const response = await page.request.get('/ping')
      const payload = await response.json()
      expect(payload.status).toBe('UP')
    })

    test('Info is accessible', async ({ page }) => {
      const response = await page.request.get('/info')
      const payload = await response.json()
      expect(payload.build.name).toBe('hmpps-nomis-sync-dashboard')
    })
  })

  test.describe('Some unhealthy', () => {
    test.beforeEach(async () => {
      await Promise.all([hmppsAuth.stubPing(), nomisPrisonerApi.stubPing(), tokenVerification.stubPing(500)])
    })

    test('Health check status is down', async ({ page }) => {
      const response = await page.request.get('/health')
      const payload = await response.json()
      expect(payload.status).toBe('DOWN')
      expect(payload.components.hmppsAuth.status).toBe('UP')
      expect(payload.components.nomisPrisoner.status).toBe('UP')
      expect(payload.components.tokenVerification.status).toBe('DOWN')
      expect(payload.components.tokenVerification.details.status).toBe(500)
      expect(payload.components.tokenVerification.details.attempts).toBe(3)
    })
  })
})
