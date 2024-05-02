import type { StartCSIPMigrationForm } from 'forms'
import { validate as validateForm } from '../../validation/validation'

export default function validate(form: StartCSIPMigrationForm): Express.ValidationError[] {
  return validateForm(
    form,
    {
      fromDate: 'date',
      toDate: 'date',
    },
    {},
  )
}
