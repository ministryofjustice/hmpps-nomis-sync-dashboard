import type { StartCSIPMigrationForm } from 'forms'
import validate from './startCSIPMigrationValidator'

describe('startCSIPMigrationValidator', () => {
  it('should no errors when everthing is valid', () => {
    const form: StartCSIPMigrationForm = {
      ...validForm,
      action: 'startMigration',
    }
    expect(validate(form)).toHaveLength(0)
  })

  it('should reject invalid fromDate', () => {
    const form: StartCSIPMigrationForm = {
      ...validForm,
      fromDate: 'invalid',
    }

    expect(validate(form)).toContainEqual({
      href: '#fromDate',
      text: 'Enter a real date, like 2020-03-23',
    })
  })

  it('should reject invalid toDate', () => {
    const form: StartCSIPMigrationForm = {
      ...validForm,
      toDate: '124-01-01',
    }

    expect(validate(form)).toContainEqual({
      href: '#toDate',
      text: 'Enter a real date, like 2020-03-23',
    })
  })
})

const validForm: StartCSIPMigrationForm = {
  fromDate: '2020-03-23',
  toDate: '2020-03-24',
  action: 'startMigration',
}
