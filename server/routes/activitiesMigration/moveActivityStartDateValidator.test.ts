import moment from 'moment'
import { MoveActivityStartDateForm } from 'express-session'
import validate from './moveActivityStartDateValidator'

describe('moveActivityStartDateValidator', () => {
  it('should have no errors when valid', () => {
    const form: MoveActivityStartDateForm = {
      migrationId: 'any',
      activityStartDate: moment().add(1, 'days').format('YYYY-MM-DD'),
      newActivityStartDate: moment().add(2, 'days').format('YYYY-MM-DD'),
    }

    expect(validate(form)).toHaveLength(0)
  })

  it('should error if trying to move start date when activity is already started', () => {
    const form: MoveActivityStartDateForm = {
      migrationId: 'any',
      activityStartDate: moment().format('YYYY-MM-DD'),
      newActivityStartDate: moment().add(2, 'days').format('YYYY-MM-DD'),
    }

    expect(validate(form)).toContainEqual({
      href: '#activityStartDate',
      text: 'You cannot move the date for an activity that has already started.',
    })
  })

  it('should error for invalid date', () => {
    const form: MoveActivityStartDateForm = {
      migrationId: 'any',
      activityStartDate: moment().add(1, 'days').format('YYYY-MM-DD'),
      newActivityStartDate: 'not a date',
    }

    expect(validate(form)).toContainEqual({ href: '#newActivityStartDate', text: 'Enter a valid date.' })
  })

  it('should error for missing date', () => {
    const form: MoveActivityStartDateForm = {
      migrationId: 'any',
      activityStartDate: moment().add(1, 'days').format('YYYY-MM-DD'),
      newActivityStartDate: null,
    }

    expect(validate(form)).toContainEqual({ href: '#newActivityStartDate', text: 'Enter a date.' })
  })

  it('should error for start date not after existing start date', () => {
    const form: MoveActivityStartDateForm = {
      migrationId: 'any',
      activityStartDate: moment().add(2, 'days').format('YYYY-MM-DD'),
      newActivityStartDate: moment().add(1, 'days').format('YYYY-MM-DD'),
    }

    expect(validate(form)).toContainEqual({
      href: '#newActivityStartDate',
      text: 'The new activity start date must be after the existing start date.',
    })
  })
})
