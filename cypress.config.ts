import { defineConfig } from 'cypress'
import { resetStubs } from './integration_tests/mockApis/wiremock'
import auth from './integration_tests/mockApis/auth'
import tokenVerification from './integration_tests/mockApis/tokenVerification'
import nomisMigrationApi from './integration_tests/mockApis/nomisMigrationApi'
import nomisActivitiesMigrationApi from './integration_tests/mockApis/nomisActivitiesMigrationApi'
import nomisAllocationsMigrationApi from './integration_tests/mockApis/nomisAllocationsMigrationApi'
import nomisAppointmentsMigrationApi from './integration_tests/mockApis/nomisAppointmentsMigrationApi'
import nomisIncidentsMigrationApi from './integration_tests/mockApis/nomisIncidentsMigrationApi'
import nomisPrisonerApi from './integration_tests/mockApis/nomisPrisonerApi'
import mappingApi from './integration_tests/mockApis/mappingApi'
import activitiesApi from './integration_tests/mockApis/activitiesApi'
import nomisContactDetailsMigrationApi from './integration_tests/mockApis/nomisContactDetailsMigrationApi'
import nomisVisitsMigrationApi from './integration_tests/mockApis/nomisVisitsMigrationApi'
import nomisSentencingMigrationApi from './integration_tests/mockApis/nomisSentencingMigrationApi'

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
    setupNodeEvents(on) {
      on('task', {
        reset: resetStubs,
        ...auth,
        ...tokenVerification,
        ...nomisMigrationApi,
        ...nomisPrisonerApi,
        ...nomisActivitiesMigrationApi,
        ...nomisAllocationsMigrationApi,
        ...nomisAppointmentsMigrationApi,
        ...nomisContactDetailsMigrationApi,
        ...nomisIncidentsMigrationApi,
        ...nomisSentencingMigrationApi,
        ...nomisVisitsMigrationApi,
        ...mappingApi,
        ...activitiesApi,
      })
    },
    baseUrl: 'http://localhost:3007',
    excludeSpecPattern: '**/!(*.cy).ts',
    specPattern: 'integration_tests/e2e/**/*.cy.{js,jsx,ts,tsx}',
    supportFile: 'integration_tests/support/index.ts',
  },
})
