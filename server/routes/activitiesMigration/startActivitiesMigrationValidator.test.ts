import type { StartActivitiesMigrationForm } from 'forms'
import moment from 'moment'
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
      ...validForm,
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

  it('should reject missing activity start date', () => {
    const form: StartActivitiesMigrationForm = {
      ...validForm,
      activityStartDate: null,
    }

    expect(validate(form)).toContainEqual({ href: '#activityStartDate', text: 'Enter a date.' })
  })

  it('should reject malformed start date', () => {
    const form: StartActivitiesMigrationForm = {
      ...validForm,
      activityStartDate: 'invalid',
    }

    expect(validate(form)).toContainEqual({ href: '#activityStartDate', text: 'Enter a valid date.' })
  })

  it('should reject start date before tomorrow', () => {
    const today: string = moment().format('YYYY-MM-DD')
    const form: StartActivitiesMigrationForm = {
      ...validForm,
      activityStartDate: today,
    }

    expect(validate(form)).toContainEqual({
      href: '#activityStartDate',
      text: `The activity start date must be after today.`,
    })
  })
})

const validForm: StartActivitiesMigrationForm = {
  prisonId: 'HEI',
  activityStartDate: moment().add(1, 'days').format('YYYY-MM-DD'),
  courseActivityId: 12345,
}
