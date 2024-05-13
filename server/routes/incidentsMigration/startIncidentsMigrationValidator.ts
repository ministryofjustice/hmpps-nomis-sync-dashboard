import type { StartIncidentsMigrationForm } from 'forms'
import { validate as validateForm } from '../../validation/validation'

export default function validate(form: StartIncidentsMigrationForm): Express.ValidationError[] {
  return validateForm(
    form,
    {
      fromDate: 'date',
      toDate: 'date',
    },
    {},
  )
}
