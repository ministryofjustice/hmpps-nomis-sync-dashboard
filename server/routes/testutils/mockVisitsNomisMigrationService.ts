import VisitsNomisMigrationService from '../../services/visits/visitsNomisMigrationService'

jest.mock('../../services/visits/visitsNomisMigrationService')

const visitsNomisMigrationService = new VisitsNomisMigrationService(null) as jest.Mocked<VisitsNomisMigrationService>

export default visitsNomisMigrationService
