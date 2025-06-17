import NomisMigrationService from '../../services/nomisMigrationService'

jest.mock('../../services/nomisMigrationService')

const nomisMigrationService = new NomisMigrationService(null) as jest.Mocked<NomisMigrationService>

export default nomisMigrationService
