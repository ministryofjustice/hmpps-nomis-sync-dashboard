import type { StartSentencingMigrationForm } from 'forms'
import validate from './startSentencingMigrationValidator'

describe('startSentencingMigrationValidator', () => {
  it('should no errors when everthing is valid', () => {
    const form: StartSentencingMigrationForm = {
      ...validForm,
      action: 'startMigration',
    }
    expect(validate(form)).toHaveLength(0)
  })

  it('should reject invalid fromDate', () => {
    const form: StartSentencingMigrationForm = {
      ...validForm,
      fromDate: 'invalid',
    }

    expect(validate(form)).toContainEqual({
      href: '#fromDate',
      text: 'Enter a real date, like 2020-03-23',
    })
  })

  it('should reject invalid toDate', () => {
    const form: StartSentencingMigrationForm = {
      ...validForm,
      toDate: '124-01-01',
    }

    expect(validate(form)).toContainEqual({
      href: '#toDate',
      text: 'Enter a real date, like 2020-03-23',
    })
  })
})

const validForm: StartSentencingMigrationForm = {
  fromDate: '2020-03-23',
  toDate: '2020-03-24',
  action: 'startMigration',
}
