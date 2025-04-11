import AppointmentsNomisMigrationService from '../../services/appointments/appointmentsNomisMigrationService'

jest.mock('../../services/appointments/appointmentsNomisMigrationService')

const appointmentsNomisMigrationService = new AppointmentsNomisMigrationService(
  null,
) as jest.Mocked<AppointmentsNomisMigrationService>

export default appointmentsNomisMigrationService
