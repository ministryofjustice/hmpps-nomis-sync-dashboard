import ActivitiesNomisMigrationService from '../../services/activities/activitiesNomisMigrationService'

jest.mock('../../services/activities/activitiesNomisMigrationService')

const activitiesNomisMigrationService = new ActivitiesNomisMigrationService(
  null,
) as jest.Mocked<ActivitiesNomisMigrationService>

export default activitiesNomisMigrationService
