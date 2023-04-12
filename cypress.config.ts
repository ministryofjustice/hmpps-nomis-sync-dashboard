import { defineConfig } from 'cypress'
import { resetStubs } from './integration_tests/mockApis/wiremock'
import auth from './integration_tests/mockApis/auth'
import tokenVerification from './integration_tests/mockApis/tokenVerification'
import nomisMigrationApi from './integration_tests/mockApis/nomisMigrationApi'
import nomisPrisonerApi from './integration_tests/mockApis/nomisPrisonerApi'
import mappingApi from './integration_tests/mockApis/mappingApi'

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
        stubListOfSentencingMigrationHistory: nomisMigrationApi.stubListOfSentencingMigrationHistory,
        stubNomisMigrationPing: nomisMigrationApi.stubNomisMigrationPing,
        stubStartVisitsMigration: nomisMigrationApi.stubStartVisitsMigration,
        stubStartSentencingMigration: nomisMigrationApi.stubStartSentencingMigration,
        stubGetVisitsFailures: nomisMigrationApi.stubGetVisitsFailures,
        stubGetSentencingFailures: nomisMigrationApi.stubGetSentencingFailures,
        stubDeleteFailures: nomisMigrationApi.stubDeleteVisitsFailures,
        stubDeleteSentencingFailures: nomisMigrationApi.stubDeleteSentencingFailures,
        stubHealth: nomisMigrationApi.stubHealth,
        stubNomisPrisonerPing: nomisPrisonerApi.stubNomisPrisonerPing,
        stubGetVisitMigrationEstimatedCount: nomisPrisonerApi.stubGetVisitMigrationEstimatedCount,
        stubGetSentencingMigrationEstimatedCount: nomisPrisonerApi.stubGetSentencingMigrationEstimatedCount,
        stubGetVisitsMigrationDetailsStarted: nomisMigrationApi.stubGetVisitsMigrationDetailsStarted,
        stubGetSentencingMigrationDetailsStarted: nomisMigrationApi.stubGetSentencingMigrationDetailsStarted,
        stubGetVisitsMigrationDetailsCompleted: nomisMigrationApi.stubGetVisitsMigrationDetailsCompleted,
        stubGetSentencingMigrationDetailsCompleted: nomisMigrationApi.stubGetSentencingMigrationDetailsCompleted,
        stubInfoInProgress: nomisMigrationApi.stubInfoInProgress,
        stubInfoCompleted: nomisMigrationApi.stubInfoCompleted,
        stubGetVisitMigrationRoomUsage: nomisMigrationApi.stubGetVisitMigrationRoomUsage,
        stubGetVisitRoomMappings: mappingApi.stubGetVisitRoomMappings,
        stubGetVisitRoomUsage: nomisPrisonerApi.stubGetVisitRoomUsage,
        stubAddVisitsRoomMapping: mappingApi.stubAddVisitsRoomMapping,
      })
    },
    baseUrl: 'http://localhost:3007',
    excludeSpecPattern: '**/!(*.cy).ts',
    specPattern: 'integration_tests/e2e/**/*.cy.{js,jsx,ts,tsx}',
    supportFile: 'integration_tests/support/index.ts',
  },
})
