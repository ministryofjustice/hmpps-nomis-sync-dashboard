import HmppsAuthClient from '../../data/hmppsAuthClient'
import NomisPrisonerService from '../../services/nomisPrisonerService'

jest.mock('../../services/nomisPrisonerService')

const nomisPrisonerService = new NomisPrisonerService({} as HmppsAuthClient) as jest.Mocked<NomisPrisonerService>

export default nomisPrisonerService
