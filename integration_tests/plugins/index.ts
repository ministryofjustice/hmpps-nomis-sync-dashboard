import { resetStubs } from '../mockApis/wiremock'

import auth from '../mockApis/auth'
import tokenVerification from '../mockApis/tokenVerification'
import nomisMigrationApi from '../mockApis/nomisMigrationApi'
import nomisPrisonerApi from '../mockApis/nomisPrisonerApi'

export default (on: (string, Record) => void): void => {
  on('task', {
    reset: resetStubs,

    getSignInUrl: auth.getSignInUrl,
    stubSignIn: auth.stubSignIn,

    stubAuthUser: auth.stubUser,
    stubAuthPing: auth.stubPing,

    stubTokenVerificationPing: tokenVerification.stubPing,
    stubListOfMigrationHistory: nomisMigrationApi.stubListOfMigrationHistory,
    stubNomisMigrationPing: nomisMigrationApi.stubNomisMigrationPing,
    stubStartVisitsMigration: nomisMigrationApi.stubStartVisitsMigration,
    stubGetFailures: nomisMigrationApi.stubGetFailures,
    stubHealth: nomisMigrationApi.stubHealth,
    stubNomisPrisonerPing: nomisPrisonerApi.stubNomisPrisonerPing,
    stubGetVisitMigrationEstimatedCount: nomisPrisonerApi.stubGetVisitMigrationEstimatedCount,
    stubGetMigrationDetailsStarted: nomisMigrationApi.stubGetMigrationDetailsStarted,
    stubGetMigrationDetailsCompleted: nomisMigrationApi.stubGetMigrationDetailsCompleted,
    stubInfoInProgress: nomisMigrationApi.stubInfoInProgress,
    stubInfoCompleted: nomisMigrationApi.stubInfoCompleted,
    stubGetVisitMigrationRoomUsage: nomisPrisonerApi.stubGetVisitMigrationRoomUsage,
  })
}
