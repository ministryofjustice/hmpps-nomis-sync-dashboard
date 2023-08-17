import type { StartAdjudicationsMigrationForm } from 'forms'
import validate from './startAdjudicationsMigrationValidator'

describe('startAdjudicationsMigrationValidator', () => {
  it('should be no errors when everything is valid', () => {
    const form: StartAdjudicationsMigrationForm = {
      ...validForm,
      action: 'startMigration',
    }
    expect(validate(form)).toHaveLength(0)
  })

  it('should reject empty prisonIds', () => {
    const form: StartAdjudicationsMigrationForm = {
      ...validForm,
      prisonIds: '',
    }

    expect(validate(form)).toContainEqual({ href: '#prisonIds', text: 'Enter one or more prison IDs' })
  })

  it('should reject invalid fromDate', () => {
    const form: StartAdjudicationsMigrationForm = {
      ...validForm,
      fromDate: 'invalid',
    }

    expect(validate(form)).toContainEqual({
      href: '#fromDate',
      text: 'Enter a real date, like 2020-03-23',
    })
  })

  it('should reject invalid toDate', () => {
    const form: StartAdjudicationsMigrationForm = {
      ...validForm,
      toDate: '124-01-01',
    }

    expect(validate(form)).toContainEqual({
      href: '#toDate',
      text: 'Enter a real date, like 2020-03-23',
    })
  })
})

const validForm: StartAdjudicationsMigrationForm = {
  prisonIds: 'HEI',
  fromDate: '2020-03-23',
  toDate: '2020-03-24',
  action: 'startMigration',
}
