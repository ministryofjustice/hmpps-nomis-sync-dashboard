import { type RequestHandler, Router } from 'express'

import visitMigrationRoutes from './visitMigration/visitMigrationRouter'
import sentencingMigrationRoutes from './sentencingMigration/sentencingMigrationRouter'
import activitiesMigrationRoutes from './activitiesMigration/activitiesMigrationRouter'
import allocationsMigrationRoutes from './allocationsMigration/allocationsMigrationRouter'
import appointmentsMigrationRoutes from './appointmentsMigration/appointmentsMigrationRouter'
import alertsMigrationRoutes from './alertsMigration/alertsMigrationRouter'
import incidentsMigrationRoutes from './incidentsMigration/incidentsMigrationRouter'
import csipMigrationRoutes from './csipMigration/csipMigrationRouter'
import prisonPersonMigrationRoutes from './prisonPersonMigration/prisonPersonMigrationRouter'
import {
  extractRoles,
  MIGRATE_SENTENCING_ROLE,
  MIGRATE_VISITS_ROLE,
  MIGRATE_ACTIVITIES_ROLE,
  MIGRATE_ALLOCATIONS_ROLE,
  MIGRATE_APPOINTMENTS_ROLE,
  MIGRATE_ALERTS_ROLE,
  MIGRATE_INCIDENT_REPORTS_ROLE,
  MIGRATE_CSIP_ROLE,
  MIGRATE_PRISONPERSON_ROLE,
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
          id: 'alerts-migration',
          heading: 'Alerts migration',
          description: 'Migration and synchronisation information',
          href: '/alerts-migration',
          roles: [MIGRATE_ALERTS_ROLE],
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
          id: 'incidents-migration',
          heading: 'Incidents migration',
          description: 'Migration and synchronisation information',
          href: '/incidents-migration',
          roles: [MIGRATE_INCIDENT_REPORTS_ROLE],
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
          id: 'prisonperson-migration',
          heading: 'Prison Person migration',
          description: 'WIP - DO NOT USE! Migration and synchronisation information',
          href: '/prisonperson-migration',
          roles: [MIGRATE_PRISONPERSON_ROLE],
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
  alertsMigrationRoutes(router, services)
  incidentsMigrationRoutes(router, services)
  csipMigrationRoutes(router, services)
  prisonPersonMigrationRoutes(router, services)
  return router
}
