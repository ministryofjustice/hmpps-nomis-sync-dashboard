import NomisPrisonerService from '../../services/nomisPrisonerService'
import NomisPrisonerClient from '../../data/nomisPrisonerClient'

jest.mock('../../services/nomisPrisonerService')

const nomisPrisonerService = new NomisPrisonerService({} as NomisPrisonerClient) as jest.Mocked<NomisPrisonerService>

export default nomisPrisonerService
