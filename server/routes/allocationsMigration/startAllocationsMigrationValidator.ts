import type { StartAllocationsMigrationForm } from 'forms'
import { validate as validateForm } from '../../validation/validation'

export default function validate(form: StartAllocationsMigrationForm): Express.ValidationError[] {
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
