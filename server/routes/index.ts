import { Router } from 'express'

import visitMigrationRoutes from './visitMigration/visitMigrationRouter'
import visitRoomMappingMigrationRouter from './visitMigration/visitRoomMappingMigrationRouter'
import sentencingMigrationRoutes from './sentencingMigration/sentencingMigrationRouter'
import activitiesMigrationRoutes from './activitiesMigration/activitiesMigrationRouter'
import allocationsMigrationRoutes from './allocationsMigration/allocationsMigrationRouter'
import appointmentsMigrationRoutes from './appointmentsMigration/appointmentsMigrationRouter'
import courtSentencingMigrationRoutes from './courtSentencingMigration/courtSentencingMigrationRouter'
import incidentsMigrationRoutes from './incidentsMigration/incidentsMigrationRouter'
import corePersonMigrationRoutes from './corePersonMigration/corePersonMigrationRouter'
import contactPersonMigrationRoutes from './contactPersonMigration/contactPersonMigrationRouter'
import contactPersonProfileDetailsMigrationRoutes from './contactPersonMigration/contactPersonProfileDetailsMigration/contactPersonProfileDetailsMigrationRouter'
import visitslotsMigrationRoutes from './visitslotsMigration/visitslotsMigrationRouter'
import prisonBalanceMigrationRoutes from './financeMigration/prisonBalanceMigrationRouter'
import prisonerBalanceMigrationRoutes from './financeMigration/prisonerBalanceMigrationRouter'
import movementsMigrationRoutes from './movementsMigration/movementsMigrationRouter'
import officialvisitsMigrationRoutes from './officialvisitsMigration/officialvisitsMigrationRouter'

import {
  extractRoles,
  MIGRATE_SENTENCING_ROLE,
  MIGRATE_VISITS_ROLE,
  MIGRATE_ACTIVITIES_ROLE,
  MIGRATE_APPOINTMENTS_ROLE,
  MIGRATE_NOMIS_SYSCON,
} from '../authentication/roles'

import type { Services } from '../services'

interface Dashboard {
  id: string
  heading: string
  description?: string
  href: string
  roles: string[]
  enabled: boolean
}
const dashboards: Dashboard[] = [
  {
    id: 'visits-migration',
    heading: 'Visits migration',
    href: '/visits-migration',
    roles: [MIGRATE_VISITS_ROLE, MIGRATE_NOMIS_SYSCON],
    enabled: true,
  },
  {
    id: 'sentencing-migration',
    heading: 'Sentencing migration',
    href: '/sentencing-migration',
    roles: [MIGRATE_SENTENCING_ROLE, MIGRATE_NOMIS_SYSCON],
    enabled: true,
  },
  {
    id: 'activities-migration',
    heading: 'Activities migration',
    href: '/activities-migration',
    roles: [MIGRATE_ACTIVITIES_ROLE, MIGRATE_NOMIS_SYSCON],
    enabled: true,
  },
  {
    id: 'allocations-migration',
    heading: 'Allocations migration',
    href: '/allocations-migration',
    roles: [MIGRATE_ACTIVITIES_ROLE, MIGRATE_NOMIS_SYSCON],
    enabled: true,
  },
  {
    id: 'appointments-migration',
    heading: 'Appointments migration',
    href: '/appointments-migration',
    roles: [MIGRATE_APPOINTMENTS_ROLE, MIGRATE_NOMIS_SYSCON],
    enabled: true,
  },
  {
    id: 'court-sentencing-migration',
    heading: 'Court Sentencing migration',
    href: '/court-sentencing-migration',
    roles: [MIGRATE_SENTENCING_ROLE, MIGRATE_NOMIS_SYSCON],
    enabled: true,
  },
  {
    id: 'room-mappings',
    heading: 'Visit room mappings',
    href: '/visits-room-mappings/prison',
    roles: [MIGRATE_VISITS_ROLE, MIGRATE_NOMIS_SYSCON],
    enabled: true,
  },
  {
    id: 'coreperson-migration',
    heading: 'Core Person migration',
    href: '/coreperson-migration',
    roles: [MIGRATE_NOMIS_SYSCON],
    enabled: true,
  },
  {
    id: 'incidents-migration',
    heading: 'Incidents migration',
    href: '/incidents-migration',
    roles: [MIGRATE_NOMIS_SYSCON],
    enabled: true,
  },
  {
    id: 'contactperson-migration',
    heading: 'Prisoner Restriction migration',
    href: '/contactperson-migration',
    roles: [MIGRATE_NOMIS_SYSCON],
    enabled: true,
  },
  {
    id: 'contactperson-profiledetails-migration',
    heading: 'Contact Person Profile Details migration',
    href: '/contactperson-profiledetails-migration',
    roles: [MIGRATE_NOMIS_SYSCON],
    enabled: true,
  },
  {
    id: 'visitslots-migration',
    heading: 'Visit Slots migration',
    href: '/visitslots-migration',
    roles: [MIGRATE_NOMIS_SYSCON],
    enabled: true,
  },
  {
    id: 'officialvisits-migration',
    heading: 'Official Visits migration',
    href: '/officialvisits-migration',
    roles: [MIGRATE_NOMIS_SYSCON],
    enabled: true,
  },
  {
    id: 'prison-balance-migration',
    heading: 'Prison balance migration',
    href: '/prison-balance-migration',
    roles: [MIGRATE_NOMIS_SYSCON],
    enabled: true,
  },
  {
    id: 'prisoner-balance-migration',
    heading: 'Prisoner balance migration',
    href: '/prisoner-balance-migration',
    roles: [MIGRATE_NOMIS_SYSCON],
    enabled: true,
  },
  {
    id: 'movements-migration',
    heading: 'Temporary Absence migration',
    href: '/movements-migration',
    roles: [MIGRATE_NOMIS_SYSCON],
    enabled: true,
  },
].sort((a: Dashboard, b: Dashboard) => a.heading.localeCompare(b.heading))

export default function routes(services: Services): Router {
  const router = Router()

  router.get('/', (req, res, _) => {
    const roles = extractRoles(res)
    res.render('pages/index', {
      dashboards: dashboards.filter(
        register =>
          Boolean(register.roles === null || register.roles.find(role => roles.includes(role))) && register.enabled,
      ),
    })
  })

  router.use('/visits-migration', visitMigrationRoutes(services))
  router.use('/visits-room-mappings', visitRoomMappingMigrationRouter(services))
  router.use('/sentencing-migration', sentencingMigrationRoutes(services))
  router.use('/activities-migration', activitiesMigrationRoutes(services))
  router.use('/allocations-migration', allocationsMigrationRoutes(services))
  router.use('/appointments-migration', appointmentsMigrationRoutes(services))
  router.use('/court-sentencing-migration', courtSentencingMigrationRoutes(services))
  router.use('/incidents-migration', incidentsMigrationRoutes(services))
  router.use('/coreperson-migration', corePersonMigrationRoutes(services))
  router.use('/contactperson-migration', contactPersonMigrationRoutes(services))
  router.use('/contactperson-profiledetails-migration', contactPersonProfileDetailsMigrationRoutes(services))
  router.use('/visitslots-migration', visitslotsMigrationRoutes(services))
  router.use('/prison-balance-migration', prisonBalanceMigrationRoutes(services))
  router.use('/prisoner-balance-migration', prisonerBalanceMigrationRoutes(services))
  router.use('/movements-migration', movementsMigrationRoutes(services))
  router.use('/officialvisits-migration', officialvisitsMigrationRoutes(services))

  return router
}
