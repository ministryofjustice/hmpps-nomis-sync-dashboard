import { type RequestHandler, Router } from 'express'

import visitMigrationRoutes from './visitMigration/visitMigrationRouter'
import sentencingMigrationRoutes from './sentencingMigration/sentencingMigrationRouter'
import activitiesMigrationRoutes from './activitiesMigration/activitiesMigrationRouter'
import allocationsMigrationRoutes from './allocationsMigration/allocationsMigrationRouter'
import appointmentsMigrationRoutes from './appointmentsMigration/appointmentsMigrationRouter'
import courtSentencingMigrationRoutes from './courtSentencingMigration/courtSentencingMigrationRouter'
import incidentsMigrationRoutes from './incidentsMigration/incidentsMigrationRouter'
import corePersonMigrationRoutes from './corePersonMigration/corePersonMigrationRouter'
import csipMigrationRoutes from './csipMigration/csipMigrationRouter'
import contactPersonMigrationRoutes from './contactPersonMigration/contactPersonMigrationRouter'
import corporateMigrationRoutes from './corporateMigration/corporateMigrationRouter'
import visitBalanceMigrationRoutes from './visitBalanceMigration/visitBalanceMigrationRouter'
import {
  extractRoles,
  MIGRATE_SENTENCING_ROLE,
  MIGRATE_VISITS_ROLE,
  MIGRATE_ACTIVITIES_ROLE,
  MIGRATE_ALLOCATIONS_ROLE,
  MIGRATE_APPOINTMENTS_ROLE,
  MIGRATE_CORE_PERSON_ROLE,
  MIGRATE_CSIP_ROLE,
  MIGRATE_INCIDENT_REPORTS_ROLE,
  MIGRATE_CONTACTPERSON_ROLE,
  MIGRATE_VISIT_BALANCE_ROLE,
  MIGRATE_NOMIS_SYSCON,
} from '../authentication/roles'

import asyncMiddleware from '../middleware/asyncMiddleware'
import type { Services } from '../services'

export default function routes(services: Services): Router {
  const router = Router()
  const get = (path: string | string[], handler: RequestHandler) => router.get(path, asyncMiddleware(handler))

  get('/', (req, res, next) => {
    const roles = extractRoles(res)
    res.render('pages/index', {
      dashboards: [
        {
          id: 'visits-migration',
          heading: 'Visits migration',
          description: 'Migration and synchronisation information',
          href: '/visits-migration',
          roles: [MIGRATE_VISITS_ROLE],
          enabled: true,
        },
        {
          id: 'sentencing-migration',
          heading: 'Sentencing migration',
          description: 'Migration and synchronisation information',
          href: '/sentencing-migration',
          roles: [MIGRATE_SENTENCING_ROLE],
          enabled: true,
        },
        {
          id: 'activities-migration',
          heading: 'Activities migration',
          description: 'Migration and synchronisation information',
          href: '/activities-migration',
          roles: [MIGRATE_ACTIVITIES_ROLE],
          enabled: true,
        },
        {
          id: 'allocations-migration',
          heading: 'Allocations migration',
          description: 'Migration and synchronisation information',
          href: '/allocations-migration',
          roles: [MIGRATE_ALLOCATIONS_ROLE],
          enabled: true,
        },
        {
          id: 'appointments-migration',
          heading: 'Appointments migration',
          description: 'Migration and synchronisation information',
          href: '/appointments-migration',
          roles: [MIGRATE_APPOINTMENTS_ROLE],
          enabled: true,
        },
        {
          id: 'court-sentencing-migration',
          heading: 'Court Sentencing migration',
          description: 'Migration and synchronisation information',
          href: '/court-sentencing-migration',
          roles: [MIGRATE_SENTENCING_ROLE],
          enabled: true,
        },
        {
          id: 'room-mappings',
          heading: 'Visit room mappings',
          description: 'Manage visit room mappings between NOMIS and VSIP',
          href: '/visits-room-mappings-prison',
          roles: [MIGRATE_VISITS_ROLE],
          enabled: true,
        },
        {
          id: 'coreperson-migration',
          heading: 'Core Person migration',
          description: 'Migration and synchronisation information',
          href: '/coreperson-migration',
          roles: [MIGRATE_CORE_PERSON_ROLE, MIGRATE_NOMIS_SYSCON],
          enabled: true,
        },
        {
          id: 'csip-migration',
          heading: 'CSIP migration',
          description: 'Migration and synchronisation information',
          href: '/csip-migration',
          roles: [MIGRATE_CSIP_ROLE],
          enabled: true,
        },
        {
          id: 'incidents-migration',
          heading: 'Incidents migration',
          description: 'Migration and synchronisation information',
          href: '/incidents-migration',
          roles: [MIGRATE_INCIDENT_REPORTS_ROLE],
          enabled: true,
        },
        {
          id: 'contactperson-migration',
          heading: 'Contact Person migration',
          description: 'Migration and synchronisation information',
          href: '/contactperson-migration',
          roles: [MIGRATE_CONTACTPERSON_ROLE, MIGRATE_NOMIS_SYSCON],
          enabled: true,
        },
        {
          id: 'corporate-migration',
          heading: 'Corporate migration',
          description: 'Migration and synchronisation information',
          href: '/corporate-migration',
          roles: [MIGRATE_CONTACTPERSON_ROLE, MIGRATE_NOMIS_SYSCON],
          enabled: true,
        },
        {
          id: 'visit-balance-migration',
          heading: 'Visit balance migration',
          description: 'Migration and synchronisation information',
          href: '/visit-balance-migration',
          roles: [MIGRATE_VISIT_BALANCE_ROLE, MIGRATE_NOMIS_SYSCON],
          enabled: true,
        },
      ].filter(
        register =>
          Boolean(register.roles === null || register.roles.find(role => roles.includes(role))) && register.enabled,
      ),
    })
  })

  visitMigrationRoutes(router, services)
  sentencingMigrationRoutes(router, services)
  activitiesMigrationRoutes(router, services)
  allocationsMigrationRoutes(router, services)
  appointmentsMigrationRoutes(router, services)
  courtSentencingMigrationRoutes(router, services)
  incidentsMigrationRoutes(router, services)
  corePersonMigrationRoutes(router, services)
  csipMigrationRoutes(router, services)
  contactPersonMigrationRoutes(router, services)
  corporateMigrationRoutes(router, services)
  visitBalanceMigrationRoutes(router, services)
  return router
}
