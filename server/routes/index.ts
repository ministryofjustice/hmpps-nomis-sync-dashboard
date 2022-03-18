import type { RequestHandler, Router } from 'express'
import visitMigrationRoutes, { Services } from './visitMigration/visitMigrationRouter'
import { extractRoles, MIGRATE_VISITS_ROLE } from '../authentication/roles'

import asyncMiddleware from '../middleware/asyncMiddleware'

export default function routes(router: Router, services: Services): Router {
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
      ].filter(
        register =>
          Boolean(register.roles === null || register.roles.find(role => roles.includes(role))) && register.enabled
      ),
    })
  })

  visitMigrationRoutes(router, services)
  return router
}
