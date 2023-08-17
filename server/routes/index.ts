import { type RequestHandler, Router } from 'express'

import visitMigrationRoutes from './visitMigration/visitMigrationRouter'
import sentencingMigrationRoutes from './sentencingMigration/sentencingMigrationRouter'
import appointmentsMigrationRoutes from './appointmentsMigration/appointmentsMigrationRouter'
import adjudicationsMigrationRoutes from './adjudicationsMigration/adjudicationsMigrationRouter'
import {
  extractRoles,
  MIGRATE_SENTENCING_ROLE,
  MIGRATE_VISITS_ROLE,
  MIGRATE_APPOINTMENTS_ROLE,
  MIGRATE_ADJUDICATIONS_ROLE,
} from '../authentication/roles'

import asyncMiddleware from '../middleware/asyncMiddleware'
import { Services } from '../services'

export default function routes(services: Services): Router {
  const router = Router()

  const get = (path: string, handler: RequestHandler) => router.get(path, asyncMiddleware(handler))

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
  appointmentsMigrationRoutes(router, services)
  adjudicationsMigrationRoutes(router, services)
  return router
}
