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

  it('should allow missing course activity ID', () => {
    const form: StartAllocationsMigrationForm = {
      prisonId: 'HEI',
    }

    expect(validate(form)).toHaveLength(0)
  })

  it('should reject empty prisonId', () => {
    const form: StartAllocationsMigrationForm = {
      ...validForm,
      prisonId: '',
    }

    expect(validate(form)).toContainEqual({ href: '#prisonId', text: 'Enter a prison ID.' })
  })

  it('should reject numeric prisonId', () => {
    const form: StartAllocationsMigrationForm = {
      ...validForm,
      prisonId: '123',
    }

    expect(validate(form)).toContainEqual({ href: '#prisonId', text: 'The prison ID must contain 3 letters.' })
  })

  it('should reject prisonId with wrong size', () => {
    const form: StartAllocationsMigrationForm = {
      ...validForm,
      prisonId: 'ABCD',
    }

    expect(validate(form)).toContainEqual({ href: '#prisonId', text: 'The prison ID must contain 3 letters.' })
  })
})

const validForm: StartAllocationsMigrationForm = {
  prisonId: 'HEI',
  courseActivityId: 12345,
}
