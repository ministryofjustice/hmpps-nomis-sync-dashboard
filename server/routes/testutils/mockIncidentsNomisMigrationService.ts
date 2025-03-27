import IncidentsNomisMigrationService from '../../services/incidents/incidentsNomisMigrationService'

jest.mock('../../services/incidents/incidentsNomisMigrationService')

const incidentsNomisMigrationService =
  new IncidentsNomisMigrationService() as jest.Mocked<IncidentsNomisMigrationService>

export default incidentsNomisMigrationService
