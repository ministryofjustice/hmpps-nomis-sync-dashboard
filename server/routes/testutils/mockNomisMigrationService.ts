import NomisMigrationService from '../../services/nomisMigrationService'
import NomisMigrationClient from '../../data/nomisMigrationClient'

jest.mock('../../services/nomisMigrationService')

const nomisMigrationService = new NomisMigrationService(
  {} as NomisMigrationClient,
) as jest.Mocked<NomisMigrationService>

export default nomisMigrationService
