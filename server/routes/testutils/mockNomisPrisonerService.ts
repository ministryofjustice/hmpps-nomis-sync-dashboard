import NomisPrisonerService from '../../services/nomisPrisonerService'

jest.mock('../../services/nomisPrisonerService')

const nomisPrisonerService = new NomisPrisonerService(null) as jest.Mocked<NomisPrisonerService>

export default nomisPrisonerService
