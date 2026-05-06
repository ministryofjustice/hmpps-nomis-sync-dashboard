import AppointmentsNomisMigrationService from '../../services/appointments/appointmentsNomisMigrationService'
import AppointmentsNomisMigrationClient from '../../data/appointmentsNomisMigrationClient'

jest.mock('../../services/appointments/appointmentsNomisMigrationService')

const appointmentsNomisMigrationService = new AppointmentsNomisMigrationService(
  {} as AppointmentsNomisMigrationClient,
) as jest.Mocked<AppointmentsNomisMigrationService>

export default appointmentsNomisMigrationService
