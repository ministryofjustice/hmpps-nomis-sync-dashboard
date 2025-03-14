import { PrisonFilteredMigrationForm } from 'express-session'
import { validate as validateForm } from '../../validation/validation'

export default function validate(form: PrisonFilteredMigrationForm): Express.ValidationError[] {
  return validateForm(
    form,
    {
      prisonId: ['required', 'alpha', 'size:3'],
    },
    {
      'required.prisonId': 'Enter a prison ID.',
      'alpha.prisonId': 'The prison ID must contain 3 letters.',
      'size.prisonId': 'The prison ID must contain 3 letters.',
    },
  )
}
