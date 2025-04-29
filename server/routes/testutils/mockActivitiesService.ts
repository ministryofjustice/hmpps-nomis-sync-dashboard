import ActivitiesService from '../../services/activitiesService'

jest.mock('../../services/activitiesService')

const activitiesService = new ActivitiesService(null) as jest.Mocked<ActivitiesService>

export default activitiesService
