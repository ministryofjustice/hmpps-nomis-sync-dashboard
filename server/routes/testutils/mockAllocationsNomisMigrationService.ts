import AllocationsNomisMigrationService from '../../services/allocations/allocationsNomisMigrationService'
import AllocationsNomisMigrationClient from '../../data/allocationsNomisMigrationClient'

jest.mock('../../services/allocations/allocationsNomisMigrationService')

const allocationsNomisMigrationService = new AllocationsNomisMigrationService(
  {} as AllocationsNomisMigrationClient,
) as jest.Mocked<AllocationsNomisMigrationService>

export default allocationsNomisMigrationService
