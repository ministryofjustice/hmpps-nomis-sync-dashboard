import { type RequestHandler, Router } from 'express'

import visitMigrationRoutes from './visitMigration/visitMigrationRouter'
import incentiveMigrationRoutes from './incentiveMigration/incentiveMigrationRouter'
import { extractRoles, MIGRATE_INCENTIVES_ROLE, MIGRATE_VISITS_ROLE } from '../authentication/roles'

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
          id: 'incentives-migration',
          heading: 'Incentives migration',
          description: 'Migration and synchronisation information',
          href: '/incentives-migration',
          roles: [MIGRATE_INCENTIVES_ROLE],
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
  incentiveMigrationRoutes(router, services)
  return router
}
