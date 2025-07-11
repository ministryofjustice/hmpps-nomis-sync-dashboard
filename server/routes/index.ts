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
  MIGRATE_INCIDENT_REPORTS_ROLE,
  MIGRATE_CONTACTPERSON_ROLE,
  MIGRATE_VISIT_BALANCE_ROLE,
  MIGRATE_NOMIS_SYSCON,
} from '../authentication/roles'

import type { Services } from '../services'

export default function routes(services: Services): Router {
  const router = Router()

  router.get('/', (req, res, _) => {
    const roles = extractRoles(res)
    res.render('pages/index', {
      dashboards: [
        {
          id: 'visits-migration',
          heading: 'Visits migration',
          description: 'Migration and synchronisation information',
          href: '/visits-migration',
          roles: [MIGRATE_VISITS_ROLE, MIGRATE_NOMIS_SYSCON],
          enabled: true,
        },
        {
          id: 'sentencing-migration',
          heading: 'Sentencing migration',
          description: 'Migration and synchronisation information',
          href: '/sentencing-migration',
          roles: [MIGRATE_SENTENCING_ROLE, MIGRATE_NOMIS_SYSCON],
          enabled: true,
        },
        {
          id: 'activities-migration',
          heading: 'Activities migration',
          description: 'Migration and synchronisation information',
          href: '/activities-migration',
          roles: [MIGRATE_ACTIVITIES_ROLE, MIGRATE_NOMIS_SYSCON],
          enabled: true,
        },
        {
          id: 'allocations-migration',
          heading: 'Allocations migration',
          description: 'Migration and synchronisation information',
          href: '/allocations-migration',
          roles: [MIGRATE_ALLOCATIONS_ROLE, MIGRATE_NOMIS_SYSCON],
          enabled: true,
        },
        {
          id: 'appointments-migration',
          heading: 'Appointments migration',
          description: 'Migration and synchronisation information',
          href: '/appointments-migration',
          roles: [MIGRATE_APPOINTMENTS_ROLE, MIGRATE_NOMIS_SYSCON],
          enabled: true,
        },
        {
          id: 'court-sentencing-migration',
          heading: 'Court Sentencing migration',
          description: 'Migration and synchronisation information',
          href: '/court-sentencing-migration',
          roles: [MIGRATE_SENTENCING_ROLE, MIGRATE_NOMIS_SYSCON],
          enabled: true,
        },
        {
          id: 'room-mappings',
          heading: 'Visit room mappings',
          description: 'Manage visit room mappings between NOMIS and VSIP',
          href: '/visits-room-mappings/prison',
          roles: [MIGRATE_VISITS_ROLE, MIGRATE_NOMIS_SYSCON],
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
          id: 'incidents-migration',
          heading: 'Incidents migration',
          description: 'Migration and synchronisation information',
          href: '/incidents-migration',
          roles: [MIGRATE_INCIDENT_REPORTS_ROLE, MIGRATE_NOMIS_SYSCON],
          enabled: true,
        },
        {
          id: 'contactperson-migration',
          heading: 'Prisoner Restriction migration',
          description: 'Migration and synchronisation information',
          href: '/contactperson-migration',
          roles: [MIGRATE_CONTACTPERSON_ROLE, MIGRATE_NOMIS_SYSCON],
          enabled: true,
        },
        {
          id: 'contactperson-profiledetails-migration',
          heading: 'Contact Person Profile Details migration',
          description: 'Migration and synchronisation information',
          href: '/contactperson-profiledetails-migration',
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
  router.use('/corporate-migration', corporateMigrationRoutes(services))
  router.use('/visit-balance-migration', visitBalanceMigrationRoutes(services))
  return router
}
