import HmppsAuthClient from '../../data/hmppsAuthClient'
import NomisMigrationService from '../../services/nomisMigrationService'

jest.mock('../../services/nomisMigrationService')

const nomisMigrationService = new NomisMigrationService({} as HmppsAuthClient) as jest.Mocked<NomisMigrationService>

export default nomisMigrationService
