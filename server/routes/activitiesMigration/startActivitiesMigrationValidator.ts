import type { StartActivitiesMigrationForm } from 'forms'
import moment from 'moment'
import { validate as validateForm } from '../../validation/validation'

export default function validate(form: StartActivitiesMigrationForm): Express.ValidationError[] {
  return validateForm(
    form,
    {
      prisonId: ['required', 'alpha', 'size:3'],
      activityStartDate: ['required', 'date', `after:${moment().format('YYYY-MM-DD')}`],
      courseActivityId: ['integer'],
    },
    {
      'required.prisonId': 'Enter a prison ID.',
      'alpha.prisonId': 'The prison ID must contain 3 letters.',
      'size.prisonId': 'The prison ID must contain 3 letters.',
      'required.activityStartDate': 'Enter a date.',
      'date.activityStartDate': 'Enter a valid date.',
      'after.activityStartDate': 'The activity start date must be after today.',
      'integer.courseActivityId': 'The Course Activity ID must be an integer.',
    },
  )
}
