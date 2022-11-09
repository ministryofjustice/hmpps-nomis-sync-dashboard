import HmppsAuthClient from '../../data/hmppsAuthClient'
import MappingService from '../../services/mappingService'

jest.mock('../../services/mappingService')

const mappingService = new MappingService({} as HmppsAuthClient) as jest.Mocked<MappingService>

export default mappingService
