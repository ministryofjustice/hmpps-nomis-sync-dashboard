import type { StartVisitsMigrationForm } from 'forms'
import validate from './startVisitsMigrationValidator'

describe('startVisitsMigrationValidator', () => {
  it('should be no errors when everything is valid', () => {
    const form: StartVisitsMigrationForm = {
      ...validForm,
      action: 'startMigration',
    }
    expect(validate(form)).toHaveLength(0)
  })

  it('should reject empty prisonIds', () => {
    const form: StartVisitsMigrationForm = {
      ...validForm,
      prisonIds: '',
    }

    expect(validate(form)).toContainEqual({ href: '#prisonIds', text: 'Enter one or more prison IDs' })
  })

  it('should reject empty visit types', () => {
    const form: StartVisitsMigrationForm = {
      ...validForm,
      visitTypes: '',
    }

    expect(validate(form)).toContainEqual({ href: '#visitTypes', text: 'Enter the type of visits to migrate' })
  })

  it('should reject invalid fromDateTime', () => {
    const form: StartVisitsMigrationForm = {
      ...validForm,
      fromDateTime: 'invalid',
    }

    expect(validate(form)).toContainEqual({
      href: '#fromDateTime',
      text: 'Enter a real date time, like 2020-03-23T12:00:00 or 2020-03-23',
    })
  })

  it('should reject invalid toDateTime', () => {
    const form: StartVisitsMigrationForm = {
      ...validForm,
      toDateTime: '124-01-01',
    }

    expect(validate(form)).toContainEqual({
      href: '#toDateTime',
      text: 'Enter a real date time, like 2020-03-23T12:00:00 or 2020-03-23',
    })
  })

  it('should allow short time format in to/fromDateTime', () => {
    const form: StartVisitsMigrationForm = {
      ...validForm,
      fromDateTime: '2020-03-23T12',
      toDateTime: '2020-03-23T12',
    }

    expect(validate(form)).toHaveLength(0)
  })

  it('should allow just date in to/fromDateTime', () => {
    const form: StartVisitsMigrationForm = {
      ...validForm,
      fromDateTime: '2020-03-23',
      toDateTime: '2020-03-23',
    }

    expect(validate(form)).toHaveLength(0)
  })
})

const validForm: StartVisitsMigrationForm = {
  prisonIds: 'HEI',
  visitTypes: ['SCON'],
  fromDateTime: '2020-03-23T12:00:00',
  toDateTime: '2020-03-24T12:00:00',
  action: 'startMigration',
}
