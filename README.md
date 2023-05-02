# NOMIS Synchronisation and Migration Dashboard
Dashboard providing overview and management of nomis migration and synchronisation

## Running the app
The easiest way to run the app is to use docker compose to create the service and all dependencies. 

`docker-compose pull`

`docker-compose up`

### Dependencies
The app requires: 
* hmpps-auth - for authentication
* redis - session store and token caching
* nomis-prisoner-api - for prisoner data
* prisoner-from-nomis-migration - for starting and monitoring the migration

### Running the app for development

To start the main services excluding the example typescript template app: 

`docker-compose up --scale=app=0`

Install dependencies using `npm install`, ensuring you are using >= `Node v16.x`

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

## Operational Instructions for Visits Migration

### Overview

This service is built to control and monitor any migration of data from NOMIS to any new service that is taking over the hosting of that data. The first of these migrations is visit data and the migration to Visit Someone in Prison (VSIP).

Migration uses AWS SQS messaging to asynchronously process a large number of records. This involves the service sending itself messages that are commands to do an action. This allows for failures to be automatically retried and eventually sent to a dead letter queue.

This dashboard invokes the [migration service](https://github.com/ministryofjustice/hmpps-prisoner-from-nomis-migration) to control the migration process. 

The process runs in 5 stages:
- Estimation stage - estimate the number of records to be migrated and create a unique migration id
- Paging stage - break the large number of records into smaller pages of 1000 records, each page is processed by retrieving the nomis visit id for each visit in that page
- Visit record message creation stage - send a message for each record that potentially requires migrating
- Migrate individual visit record - for each of the visits it will check if it has already been migrated (by checking the mapping service) and if not, will migrate it by reading the data from NOMIS and the room mapping and calling the VSIP service to create the record
- Complete stage - when the service detects there are no more messages on the queue it will mark the migration as complete

### Prerequisites

Before a migration is run it is necessary to:
* Ensure any rooms in NOMIS are mapped to their VSIP equivalents
* The number of Kubernetes pods are scaled to around 12 to increase through put.

For the latter, without this manual task the migration will happen but will complete slowly.

The scaling of the pods is done by any standard method using kubectl commands or Lens or k9s or similar.

The namespace is: `hmpps-prisoner-from-nomis-migration-prod`


### How to login

Since the dashboard is internal and used only by developers there is no menu tile to access the dashboard via either DPS or HMPPS Auth; access is via the direct link [https://nomis-sync-dashboard.hmpps.service.justice.gov.uk](https://nomis-sync-dashboard.hmpps.service.justice.gov.uk) with [dev](https://nomis-sync-dashboard-dev.hmpps.service.justice.gov.uk) and [pre-prod](https://nomis-sync-dashboard-preprod.hmpps.service.justice.gov.uk) accessible here. 

The credentials you should use will either be your NOMIS (DPS) credentials or external HMPPS credentials which have been created in HMPPS Auth. These credentials are *not* related to any client credentials you might have access to.

The credentials must be assigned the role: *MIGRATE_VISITS*
![](documentation/VisitsRole.png)

Once logged in the home page should look similar to the following:
![](documentation/HomePage.png)

If you do not have the *MIGRATE_VISITS* role then the screen is likely to look similar to this:

![](documentation/HomePageNoRole.png)

In this scenario you will need ask someone with administrative rights to give you the role (either someone in your team or for production the App Support Team)

### Starting a migration run

Once logged in with the correct credentials the link in thw *Visits migration* tile can be selected which will take you to the visits' migration homepage:

![](documentation/VisitsHomePageNoHistory.png)

In scenario that this is the first ever migration you should expect to see the *No migration records found* message and obviously the left-hand filter will never find any previous records.

After selecting the *Start new migration* button expect to see the following:

![](documentation/StartMigration.png)

After selecting the visit types (obviously this will be `Social visits` for family and social visits) and the prison (making sure to use the 3-letter code) there is an option to only migrate a partial set of data based on dates.
The date used is the date the visit is created, so this function could be used to migrate all the visits up to a certain date with the expectation that the remaining visits would be done at a later date, or it could be used to migrate 
more visits that have been accidentally created in NOMIS after VSIP was scheduled to be sole creator of visits.

There is no danger of a visit being migrated twice, since the service always checks if a visit has been migrated at the point that particular visit is about to be migrated. 

Once a filter has been selected the `Preview` button should be selected:

![](documentation/StartFilter.png)

At this point the service will calculate the potential number of visits that might be migrated. *Note: This will not take into account any records that have already been migrated, it simply counts the number of records that match the filter that has been entered.*

![](documentation/Preview.png)

*Note: Since the query to discover the number of visits requiring migration is a heavy query, do not be surprised if it takes a substantial amount of time to display this page (and occasional even time out, if it does just retry until it works, eventual Oracle will cache results ensuring it will eventually work)*
Use the opportunity to sanity check the numbers being displayed based on the knowledge you have on ths number of visits the prison will host per day.

If all looks ok go ahead and start the migration selecting `Start migration`

The service will confirm the migration has started with:
![](documentation/MigrationStart.png)

Selecting the `View migration status` will show a page that will show the current state of the migration:
![](documentation/MigrationProgress.png)

Even at this stage the migration can be cancelled:
![](documentation/MigrationCancel.png)

Cancelling a migration can take between 1 - 3 minutes as all the SQS queues are cleared, during that time the status is changed to `CANCELLED_REQUESTED`. There is no guarantee that a small number of records won't sneak through and be migrated anyway.
![](documentation/MigrationCancelRequested.png)

Eventually, after selecting the `Refresh` button the status we move to the final state of `CANCELLED`
![](documentation/MigrationCancelled.png)

Migrating around 250,000 should take around 1 hour. Refreshing the page will show progress until it is finally complete:
![](documentation/MigrationCompleted.png)

Returning to the home page will now show the last migration in the list:

![](documentation/VisitsHomeHistory.png)

### Diagnosing Issues

#### Migrated v Estimated discrepancy

A discrepancy between the estimated number of visits and the actual migrated number is valid in two scenarios:
* New visits were created in NOMIS after the migration was started
* The filter supplied included visits that have already been migrated

Running the same migration with the same filter twice would result in the first and second runs yielding the same estimate  but assuming the first run migrated all records the 2nd run would result in no new records being migrated:

![](documentation/VisitsHomeHistoryMismatch.png)

In this scenario a link to check the number of records that where already migrated is presented. The Application Insights query should confirm that the mismatched records were indeed already migrated.

#### Missing room mappings

When previewing a migration you may see a warning like the following:

![](documentation/RoomsNotMatched.png)

This means NOMIS rooms have not been mapped to VSIP rooms. Attempting to start the migration in this state would result in the visits that occurred in these rooms not being migrated. 
We would advise the migration to be abandoned and the room mappings corrected.
This is currently fixed with a PR and release of the [Mapping Service](https://github.com/ministryofjustice/hmpps-nomis-mapping-service)

#### Messages on dead letter queue before migration

When previewing a migration you may see a warning like the following:

![](documentation/DeadLetterMessages.png)

It means not all issues associated with a previous migration were resolved. We would advise the migration to be abandoned and the issues resolved. This might mean messages on the dead letter queue are removed; this requires someone with the queue admin role to do this manually. See instructions [here](https://github.com/ministryofjustice/hmpps-prisoner-from-nomis-migration#runbook)

#### Failures during migration

The history page will have a record like the following if some records failed to migrate:

![](documentation/VisitsHomeHistoryFailures.png)

Selecting the `View failures` will take you to a page with more details about the failures:

![](documentation/Failures.png)

This page is likely not to contain enough information to fix the failures. Typically, the link to `Application Insights` will show the root cause of the failure with its query taking you directly to the error that caused the specific failure.

For instance in this example the root cause is a missing room mapping (which we would have warned about earlier in the process)

![](documentation/ApplicationInsightsRoomMappingFailure.png)

#### Dead Letter Queue Handling

Any failures encountered during a migration are immediately tried twice, so any persistent error will typically be recorded three times. The retries are added to the end of a queue so for large migrations the retry might happen sometime after the original incident.
After the two retires the failing record is placed on the dead letter queue.

There is a scheduled CRON job that is run every 10 minutes that will retry any failures automatically. So if for instance there was an outage of VSIP for say 30 minutes, the system will eventually process all visit records without any intervention.

### Architecture

Architecture decision records start [here](https://github.com/ministryofjustice/hmpps-prisoner-from-nomis-migration/blob/main/doc/architecture/decisions/0001-use-adr.md)
