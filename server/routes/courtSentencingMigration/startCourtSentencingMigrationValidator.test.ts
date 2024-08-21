import type { StartCourtSentencingMigrationForm } from 'forms'
import validate from './startCourtSentencingMigrationValidator'

describe('startCourtSentencingMigrationValidator', () => {
  it('should be no errors when everything is valid', () => {
    const form: StartCourtSentencingMigrationForm = {
      ...validForm,
      action: 'startMigration',
    }
    expect(validate(form)).toHaveLength(0)
  })

  it('should reject invalid fromDate', () => {
    const form: StartCourtSentencingMigrationForm = {
      ...validForm,
      fromDate: 'invalid',
    }

    expect(validate(form)).toContainEqual({
      href: '#fromDate',
      text: 'Enter a real date, like 2020-03-23',
    })
  })

  it('should reject invalid toDate', () => {
    const form: StartCourtSentencingMigrationForm = {
      ...validForm,
      toDate: '124-01-01',
    }

    expect(validate(form)).toContainEqual({
      href: '#toDate',
      text: 'Enter a real date, like 2020-03-23',
    })
  })
})

const validForm: StartCourtSentencingMigrationForm = {
  fromDate: '2020-03-23',
  toDate: '2020-03-24',
  action: 'startMigration',
}
