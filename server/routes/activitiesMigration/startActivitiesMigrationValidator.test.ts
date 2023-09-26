import type { StartActivitiesMigrationForm } from 'forms'
import validate from './startActivitiesMigrationValidator'

describe('startActivitiesMigrationValidator', () => {
  it('should be no errors when everything is valid', () => {
    const form: StartActivitiesMigrationForm = {
      ...validForm,
      action: 'startMigration',
    }
    expect(validate(form)).toHaveLength(0)
  })

  it('should allow missing course activity ID', () => {
    const form: StartActivitiesMigrationForm = {
      prisonId: 'HEI',
    }

    expect(validate(form)).toHaveLength(0)
  })

  it('should reject empty prisonId', () => {
    const form: StartActivitiesMigrationForm = {
      ...validForm,
      prisonId: '',
    }

    expect(validate(form)).toContainEqual({ href: '#prisonId', text: 'Enter a prison ID.' })
  })

  it('should reject numeric prisonId', () => {
    const form: StartActivitiesMigrationForm = {
      ...validForm,
      prisonId: '123',
    }

    expect(validate(form)).toContainEqual({ href: '#prisonId', text: 'The prison ID must contain 3 letters.' })
  })

  it('should reject prisonId with wrong size', () => {
    const form: StartActivitiesMigrationForm = {
      ...validForm,
      prisonId: 'ABCD',
    }

    expect(validate(form)).toContainEqual({ href: '#prisonId', text: 'The prison ID must contain 3 letters.' })
  })
})

const validForm: StartActivitiesMigrationForm = {
  prisonId: 'HEI',
  courseActivityId: 12345,
}
