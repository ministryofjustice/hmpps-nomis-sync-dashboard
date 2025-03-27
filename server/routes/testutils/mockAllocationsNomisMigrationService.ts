import AllocationsNomisMigrationService from '../../services/allocations/allocationsNomisMigrationService'

jest.mock('../../services/allocations/allocationsNomisMigrationService')

const allocationsNomisMigrationService =
  new AllocationsNomisMigrationService() as jest.Mocked<AllocationsNomisMigrationService>

export default allocationsNomisMigrationService
