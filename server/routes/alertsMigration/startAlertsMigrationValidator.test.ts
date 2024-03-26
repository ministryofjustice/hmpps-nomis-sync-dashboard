import type { StartAlertsMigrationForm } from 'forms'
import validate from './startAlertsMigrationValidator'

describe('startAlertsMigrationValidator', () => {
  it('should be no errors when everything is valid', () => {
    const form: StartAlertsMigrationForm = {
      ...validForm,
      action: 'startMigration',
    }
    expect(validate(form)).toHaveLength(0)
  })

  it('should allow empty prisonIds', () => {
    const form: StartAlertsMigrationForm = {
      ...validForm,
      prisonIds: '',
    }

    expect(validate(form)).toHaveLength(0)
  })

  it('should reject invalid fromDate', () => {
    const form: StartAlertsMigrationForm = {
      ...validForm,
      fromDate: 'invalid',
    }

    expect(validate(form)).toContainEqual({
      href: '#fromDate',
      text: 'Enter a real date, like 2020-03-23',
    })
  })

  it('should reject invalid toDate', () => {
    const form: StartAlertsMigrationForm = {
      ...validForm,
      toDate: '124-01-01',
    }

    expect(validate(form)).toContainEqual({
      href: '#toDate',
      text: 'Enter a real date, like 2020-03-23',
    })
  })
})

const validForm: StartAlertsMigrationForm = {
  prisonIds: 'HEI',
  fromDate: '2020-03-23',
  toDate: '2020-03-24',
  action: 'startMigration',
}
