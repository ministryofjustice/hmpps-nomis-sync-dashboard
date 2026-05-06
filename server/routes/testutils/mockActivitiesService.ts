import ActivitiesService from '../../services/activitiesService'
import ActivitiesClient from '../../data/activitiesClient'

jest.mock('../../services/activitiesService')

const activitiesService = new ActivitiesService({} as ActivitiesClient) as jest.Mocked<ActivitiesService>

export default activitiesService
