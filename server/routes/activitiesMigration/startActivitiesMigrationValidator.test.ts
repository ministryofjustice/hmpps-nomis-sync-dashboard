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

  it('should reject empty prisonId', () => {
    const form: StartActivitiesMigrationForm = {
      ...validForm,
      prisonId: '',
    }

    expect(validate(form)).toContainEqual({ href: '#prisonId', text: 'Enter a prison ID' })
  })
})

const validForm: StartActivitiesMigrationForm = {
  prisonId: 'HEI',
  courseActivityId: 12345,
}
