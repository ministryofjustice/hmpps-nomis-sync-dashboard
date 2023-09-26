import type { StartActivitiesMigrationForm } from 'forms'
import { validate as validateForm } from '../../validation/validation'

export default function validate(form: StartActivitiesMigrationForm): Express.ValidationError[] {
  return validateForm(
    form,
    {
      prisonId: ['required', 'alpha', 'size:3'],
      courseActivityId: ['integer'],
    },
    {
      'required.prisonId': 'Enter a prison ID.',
      'alpha.prisonId': 'The prison ID must contain 3 letters.',
      'size.prisonId': 'The prison ID must contain 3 letters.',
      'integer.courseActivityId': 'The Course Activity ID must be an integer.',
    },
  )
}
