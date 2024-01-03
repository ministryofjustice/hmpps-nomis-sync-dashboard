import ActivitiesService from '../../services/activitiesService'
import HmppsAuthClient from '../../data/hmppsAuthClient'

jest.mock('../../services/activitiesService')

const activitiesService = new ActivitiesService({} as HmppsAuthClient) as jest.Mocked<ActivitiesService>

export default activitiesService
