import validate from './incidentsMigrationValidator'
import { MigrationViewFilter } from '../../@types/dashboard'

describe('visitsMigrationValidator', () => {
  it('should no errors when everything is valid', () => {
    expect(validate(validForm)).toHaveLength(0)
  })

  it('should allow an empty prisonId', () => {
    const form: MigrationViewFilter = {
      ...validForm,
      prisonId: '',
    }

    expect(validate(form)).toHaveLength(0)
  })

  it('should reject invalid fromDateTime', () => {
    const form: MigrationViewFilter = {
      ...validForm,
      fromDateTime: 'invalid',
    }

    expect(validate(form)).toContainEqual({
      href: '#fromDateTime',
      text: 'Enter a real date time, like 2020-03-23T12:00:00 or 2020-03-23',
    })
  })

  it('should reject invalid toDateTime', () => {
    const form: MigrationViewFilter = {
      ...validForm,
      toDateTime: 'invalid',
    }

    expect(validate(form)).toContainEqual({
      href: '#toDateTime',
      text: 'Enter a real date time, like 2020-03-23T12:00:00 or 2020-03-23',
    })
  })

  it('should allow just date in to/fromDateTime', () => {
    const form: MigrationViewFilter = {
      ...validForm,
      fromDateTime: '2020-03-23',
      toDateTime: '2020-03-23',
    }

    expect(validate(form)).toHaveLength(0)
  })
})

const validForm: MigrationViewFilter = {
  prisonId: 'HEI',
  fromDateTime: '2020-03-23T12:00:00',
  toDateTime: '2020-03-24T12:00:00',
  includeOnlyFailures: false,
}
