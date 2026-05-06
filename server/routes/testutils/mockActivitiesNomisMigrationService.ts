import ActivitiesNomisMigrationService from '../../services/activities/activitiesNomisMigrationService'
import ActivitiesNomisMigrationClient from '../../data/activitiesNomisMigrationClient'

jest.mock('../../services/activities/activitiesNomisMigrationService')

const activitiesNomisMigrationService = new ActivitiesNomisMigrationService(
  {} as ActivitiesNomisMigrationClient,
) as jest.Mocked<ActivitiesNomisMigrationService>

export default activitiesNomisMigrationService
