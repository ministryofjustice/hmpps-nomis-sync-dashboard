import MappingService from '../../services/mappingService'
import MappingClient from '../../data/mappingClient'

jest.mock('../../services/mappingService')

const mappingService = new MappingService({} as MappingClient) as jest.Mocked<MappingService>

export default mappingService
