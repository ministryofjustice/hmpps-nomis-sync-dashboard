import SentencingNomisMigrationService from '../../services/sentencing/sentencingNomisMigrationService'

jest.mock('../../services/sentencing/sentencingNomisMigrationService')

const sentencingNomisMigrationService = new SentencingNomisMigrationService(
  null,
) as jest.Mocked<SentencingNomisMigrationService>

export default sentencingNomisMigrationService
