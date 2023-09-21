import type { StartAllocationsMigrationForm } from 'forms'
import validate from './startAllocationsMigrationValidator'

describe('startAllocationsMigrationValidator', () => {
  it('should be no errors when everything is valid', () => {
    const form: StartAllocationsMigrationForm = {
      ...validForm,
      action: 'startMigration',
    }
    expect(validate(form)).toHaveLength(0)
  })

  it('should reject empty prisonId', () => {
    const form: StartAllocationsMigrationForm = {
      ...validForm,
      prisonId: '',
    }

    expect(validate(form)).toContainEqual({ href: '#prisonId', text: 'Enter a prison ID' })
  })
})

const validForm: StartAllocationsMigrationForm = {
  prisonId: 'HEI',
  courseActivityId: 12345,
}
