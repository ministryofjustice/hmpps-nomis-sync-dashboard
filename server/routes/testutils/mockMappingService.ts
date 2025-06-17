import MappingService from '../../services/mappingService'

jest.mock('../../services/mappingService')

const mappingService = new MappingService(null) as jest.Mocked<MappingService>

export default mappingService
