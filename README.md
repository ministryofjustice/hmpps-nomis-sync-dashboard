# hmpps-nomis-sync-dashboard
Dashboard providing overview and management of nomis migration and syncronisation

## Running the app
The easiest way to run the app is to use docker compose to create the service and all dependencies. 

`docker-compose pull`

`docker-compose up`

### Dependencies
The app requires: 
* hmpps-auth - for authentication
* redis - session store and token caching

### Running the app for development

To start the main services excluding the example typescript template app: 

`docker-compose up --scale=app=0`

Install dependencies using `npm install`, ensuring you are using >= `Node v14.x`

And then, to build the assets and start the app with nodemon:

`npm run start:dev`

### Run linter

`npm run lint`

### Run tests

`npm run test`

### Running integration tests

For local running, start a test db, redis, and wiremock instance by:

`docker-compose -f docker-compose-test.yml up`

Then run the server in test mode by:

`npm run start-feature` (or `npm run start-feature:dev` to run with nodemon)

And then either, run tests in headless mode with:

`npm run int-test`
 
Or run tests with the cypress UI:

`npm run int-test-ui`


### Generating types

Example of command to generate types from an api:

`npx openapi-typescript  https://prisoner-nomis-migration-dev.hmpps.service.justice.gov.uk/v3/api-docs --output server/@types/migrationImport/index.d.ts`
`npx openapi-typescript  https://nomis-prsner-dev.aks-dev-1.studio-hosting.service.justice.gov.uk/v3/api-docs --output server/@types/nomisPrisonerImport/index.d.ts`

