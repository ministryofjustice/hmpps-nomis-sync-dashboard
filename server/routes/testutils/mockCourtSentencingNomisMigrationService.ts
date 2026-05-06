import CourtSentencingNomisMigrationService from '../../services/courtSentencing/courtSentencingNomisMigrationService'
import CourtSentencingNomisMigrationClient from '../../data/courtSentencingNomisMigrationClient'

jest.mock('../../services/courtSentencing/courtSentencingNomisMigrationService')

const courtSentencingNomisMigrationService = new CourtSentencingNomisMigrationService(
  {} as CourtSentencingNomisMigrationClient,
) as jest.Mocked<CourtSentencingNomisMigrationService>

export default courtSentencingNomisMigrationService
