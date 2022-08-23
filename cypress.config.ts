import { defineConfig } from 'cypress'
import { resetStubs } from './integration_tests/mockApis/wiremock'
import auth from './integration_tests/mockApis/auth'
import tokenVerification from './integration_tests/mockApis/tokenVerification'
import nomisMigrationApi from './integration_tests/mockApis/nomisMigrationApi'
import nomisPrisonerApi from './integration_tests/mockApis/nomisPrisonerApi'

export default defineConfig({
  chromeWebSecurity: false,
  fixturesFolder: 'integration_tests/fixtures',
  screenshotsFolder: 'integration_tests/screenshots',
  videosFolder: 'integration_tests/videos',
  reporter: 'cypress-multi-reporters',
  reporterOptions: {
    configFile: 'reporter-config.json',
  },
  videoUploadOnPasses: false,
  taskTimeout: 60000,
  e2e: {
    // We've imported your old cypress plugins here.
    // You may want to clean this up later by importing these.
    setupNodeEvents(on) {
      on('task', {
        reset: resetStubs,

        getSignInUrl: auth.getSignInUrl,
        stubSignIn: auth.stubSignIn,

        stubAuthUser: auth.stubUser,
        stubAuthPing: auth.stubPing,

        stubTokenVerificationPing: tokenVerification.stubPing,
        stubListOfVisitsMigrationHistory: nomisMigrationApi.stubListOfVisitsMigrationHistory,
        stubListOfIncentivesMigrationHistory: nomisMigrationApi.stubListOfIncentivesMigrationHistory,
        stubNomisMigrationPing: nomisMigrationApi.stubNomisMigrationPing,
        stubStartVisitsMigration: nomisMigrationApi.stubStartVisitsMigration,
        stubGetVisitsFailures: nomisMigrationApi.stubGetVisitsFailures,
        stubGetIncentivesFailures: nomisMigrationApi.stubGetIncentivesFailures,
        stubDeleteFailures: nomisMigrationApi.stubDeleteFailures,
        stubHealth: nomisMigrationApi.stubHealth,
        stubNomisPrisonerPing: nomisPrisonerApi.stubNomisPrisonerPing,
        stubGetVisitMigrationEstimatedCount: nomisPrisonerApi.stubGetVisitMigrationEstimatedCount,
        stubGetMigrationDetailsStarted: nomisMigrationApi.stubGetMigrationDetailsStarted,
        stubGetMigrationDetailsCompleted: nomisMigrationApi.stubGetMigrationDetailsCompleted,
        stubInfoInProgress: nomisMigrationApi.stubInfoInProgress,
        stubInfoCompleted: nomisMigrationApi.stubInfoCompleted,
        stubGetVisitMigrationRoomUsage: nomisMigrationApi.stubGetVisitMigrationRoomUsage,
      })
    },
    baseUrl: 'http://localhost:3007',
    excludeSpecPattern: '**/!(*.cy).ts',
    specPattern: 'integration_tests/e2e/**/*.cy.{js,jsx,ts,tsx}',
    supportFile: 'integration_tests/support/index.ts',
  },
})
