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
        stubHealth: nomisMigrationApi.stubHealth,
        stubNomisPrisonerPing: nomisPrisonerApi.stubNomisPrisonerPing,
        stubNomisMigrationPing: nomisMigrationApi.stubNomisMigrationPing,

        stubListOfVisitsMigrationHistory: nomisMigrationApi.stubListOfVisitsMigrationHistory,
        stubStartVisitsMigration: nomisMigrationApi.stubStartVisitsMigration,
        stubGetVisitsFailures: nomisMigrationApi.stubGetVisitsFailures,
        stubDeleteFailures: nomisMigrationApi.stubDeleteVisitsFailures,
        stubGetVisitMigrationEstimatedCount: nomisPrisonerApi.stubGetVisitMigrationEstimatedCount,
        stubGetVisitsMigrationDetailsStarted: nomisMigrationApi.stubGetVisitsMigrationDetailsStarted,
        stubGetVisitsMigrationDetailsCompleted: nomisMigrationApi.stubGetVisitsMigrationDetailsCompleted,

        stubListOfSentencingMigrationHistory: nomisMigrationApi.stubListOfSentencingMigrationHistory,
        stubStartSentencingMigration: nomisMigrationApi.stubStartSentencingMigration,
        stubGetSentencingFailures: nomisMigrationApi.stubGetSentencingFailures,
        stubDeleteSentencingFailures: nomisMigrationApi.stubDeleteSentencingFailures,
        stubGetSentencingMigrationEstimatedCount: nomisPrisonerApi.stubGetSentencingMigrationEstimatedCount,
        stubGetSentencingMigrationDetailsStarted: nomisMigrationApi.stubGetSentencingMigrationDetailsStarted,
        stubGetSentencingMigrationDetailsCompleted: nomisMigrationApi.stubGetSentencingMigrationDetailsCompleted,

        stubListOfAppointmentsMigrationHistory: nomisMigrationApi.stubListOfAppointmentsMigrationHistory,
        stubStartAppointmentsMigration: nomisMigrationApi.stubStartAppointmentsMigration,
        stubGetAppointmentsFailures: nomisMigrationApi.stubGetAppointmentsFailures,
        stubDeleteAppointmentsFailures: nomisMigrationApi.stubDeleteAppointmentsFailures,
        stubGetAppointmentsMigrationEstimatedCount: nomisPrisonerApi.stubGetAppointmentsMigrationEstimatedCount,
        stubGetAppointmentsMigrationDetailsStarted: nomisMigrationApi.stubGetAppointmentsMigrationDetailsStarted,
        stubGetAppointmentsMigrationDetailsCompleted: nomisMigrationApi.stubGetAppointmentsMigrationDetailsCompleted,

        stubListOfActivitiesMigrationHistory: nomisMigrationApi.stubListOfActivitiesMigrationHistory,
        stubStartActivitiesMigration: nomisMigrationApi.stubStartActivitiesMigration,
        stubGetActivitiesFailures: nomisMigrationApi.stubGetActivitiesFailures,
        stubDeleteActivitiesFailures: nomisMigrationApi.stubDeleteActivitiesFailures,
        stubGetActivitiesMigrationEstimatedCount: nomisPrisonerApi.stubGetActivitiesMigrationEstimatedCount,
        stubGetActivitiesMigrationDetailsStarted: nomisMigrationApi.stubGetActivitiesMigrationDetailsStarted,
        stubGetActivitiesMigrationDetailsCompleted: nomisMigrationApi.stubGetActivitiesMigrationDetailsCompleted,

        stubListOfAllocationsMigrationHistory: nomisMigrationApi.stubListOfActivitiesMigrationHistory,
        stubStartAllocationsMigration: nomisMigrationApi.stubStartActivitiesMigration,
        stubGetAllocationsFailures: nomisMigrationApi.stubGetActivitiesFailures,
        stubDeleteAllocationsFailures: nomisMigrationApi.stubDeleteActivitiesFailures,
        stubGetAllocationsMigrationEstimatedCount: nomisPrisonerApi.stubGetActivitiesMigrationEstimatedCount,
        stubGetAllocationsMigrationDetailsStarted: nomisMigrationApi.stubGetActivitiesMigrationDetailsStarted,
        stubGetAllocationsMigrationDetailsCompleted: nomisMigrationApi.stubGetActivitiesMigrationDetailsCompleted,

        stubMigrationInProgress: nomisMigrationApi.stubMigrationInProgress,
        stubMigrationInProgressCompleted: nomisMigrationApi.stubMigrationInProgressCompleted,

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
