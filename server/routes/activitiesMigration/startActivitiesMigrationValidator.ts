import type { StartActivitiesMigrationForm } from 'forms'
import { validate as validateForm } from '../../validation/validation'

export default function validate(form: StartActivitiesMigrationForm): Express.ValidationError[] {
  return validateForm(
    form,
    {
      prisonId: 'required',
    },
    {
      'required.prisonId': 'Enter a prison ID',
    },
  )
}
