import AllocationsNomisMigrationService from '../../services/allocations/allocationsNomisMigrationService'

jest.mock('../../services/allocations/allocationsNomisMigrationService')

const allocationsNomisMigrationService = new AllocationsNomisMigrationService(
  null,
) as jest.Mocked<AllocationsNomisMigrationService>

export default allocationsNomisMigrationService
