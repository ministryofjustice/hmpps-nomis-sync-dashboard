import IncidentsNomisMigrationService from '../../services/incidents/incidentsNomisMigrationService'

jest.mock('../../services/incidents/incidentsNomisMigrationService')

const incidentsNomisMigrationService = new IncidentsNomisMigrationService(
  null,
) as jest.Mocked<IncidentsNomisMigrationService>

export default incidentsNomisMigrationService
