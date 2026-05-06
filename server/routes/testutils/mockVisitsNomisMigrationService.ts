import VisitsNomisMigrationService from '../../services/visits/visitsNomisMigrationService'
import VisitsNomisMigrationClient from '../../data/visitsNomisMigrationClient'

jest.mock('../../services/visits/visitsNomisMigrationService')

const visitsNomisMigrationService = new VisitsNomisMigrationService(
  {} as VisitsNomisMigrationClient,
) as jest.Mocked<VisitsNomisMigrationService>

export default visitsNomisMigrationService
