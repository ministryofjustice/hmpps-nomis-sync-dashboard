import CourtSentencingNomisMigrationService from '../../services/courtSentencing/courtSentencingNomisMigrationService'

jest.mock('../../services/courtSentencing/courtSentencingNomisMigrationService')

const courtSentencingNomisMigrationService = new CourtSentencingNomisMigrationService(
  null,
) as jest.Mocked<CourtSentencingNomisMigrationService>

export default courtSentencingNomisMigrationService
