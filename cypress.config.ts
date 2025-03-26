import { defineConfig } from 'cypress'
import { resetStubs } from './integration_tests/mockApis/wiremock'
import auth from './integration_tests/mockApis/auth'
import tokenVerification from './integration_tests/mockApis/tokenVerification'
import nomisMigrationApi from './integration_tests/mockApis/nomisMigrationApi'
import nomisActivitiesMigrationApi from './integration_tests/mockApis/nomisActivitiesMigrationApi'
import nomisAllocationsMigrationApi from './integration_tests/mockApis/nomisAllocationsMigrationApi'
import nomisAppointmentsMigrationApi from './integration_tests/mockApis/nomisAppointmentsMigrationApi'
import nomisIncidentsMigrationApi from './integration_tests/mockApis/nomisIncidentsMigrationApi'
import nomisVisitBalanceMigrationApi from './integration_tests/mockApis/nomisVisitBalanceMigrationApi'
import nomisPrisonerApi from './integration_tests/mockApis/nomisPrisonerApi'
import mappingApi from './integration_tests/mockApis/mappingApi'
import activitiesApi from './integration_tests/mockApis/activitiesApi'

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
        ...nomisIncidentsMigrationApi,
        ...nomisVisitBalanceMigrationApi,
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
