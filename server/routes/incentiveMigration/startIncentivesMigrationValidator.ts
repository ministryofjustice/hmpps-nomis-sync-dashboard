import type { StartIncentivesMigrationForm } from 'forms'
import { validate as validateForm } from '../../validation/validation'

export default function validate(form: StartIncentivesMigrationForm): Express.ValidationError[] {
  return validateForm(
    form,
    {
      fromDate: 'date',
      toDate: 'date',
    },
    {}
  )
}
