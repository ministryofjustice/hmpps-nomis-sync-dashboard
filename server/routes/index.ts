import { type RequestHandler, Router } from 'express'

import visitMigrationRoutes from './visitMigration/visitMigrationRouter'
import sentencingMigrationRoutes from './sentencingMigration/sentencingMigrationRouter'
import activitiesMigrationRoutes from './activitiesMigration/activitiesMigrationRouter'
import allocationsMigrationRoutes from './allocationsMigration/allocationsMigrationRouter'
import appointmentsMigrationRoutes from './appointmentsMigration/appointmentsMigrationRouter'
import adjudicationsMigrationRoutes from './adjudicationsMigration/adjudicationsMigrationRouter'
import {
  extractRoles,
  MIGRATE_SENTENCING_ROLE,
  MIGRATE_VISITS_ROLE,
  MIGRATE_ACTIVITIES_ROLE,
  MIGRATE_ALLOCATIONS_ROLE,
  MIGRATE_APPOINTMENTS_ROLE,
  MIGRATE_ADJUDICATIONS_ROLE,
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
          id: 'adjudications-migration',
          heading: 'Adjudications migration',
          description: 'Migration and synchronisation information',
          href: '/adjudications-migration',
          roles: [MIGRATE_ADJUDICATIONS_ROLE],
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
  adjudicationsMigrationRoutes(router, services)
  return router
}
